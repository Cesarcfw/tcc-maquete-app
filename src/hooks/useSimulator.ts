import { useEffect, useRef, useState } from 'react';
import { applyCommand, Command, connectionState, describeCommand, initialState, Scenario } from '../domain/maquette';
export type LogEntry = { id: number; time: string; message: string; type: 'info' | 'success' | 'error' };
export function useSimulator() {
  const [device, setDevice] = useState(initialState);
  const [scenario, setScenario] = useState<Scenario>('normal');
  const [now, setNow] = useState(() => Date.now());
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('Simulação pronta. Nenhum equipamento físico conectado.');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const generation = useRef(0), sequence = useRef(0), busy = useRef(false);
  const scenarioRef = useRef(scenario);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  function log(message: string, type: LogEntry['type'] = 'info') {
    setLogs(previous => [{ id: ++sequence.current, time: new Date().toLocaleTimeString('pt-BR'), message, type }, ...previous].slice(0, 30));
  }
  useEffect(() => {
    const interval = setInterval(() => {
      const time = Date.now(); setNow(time);
      if (scenarioRef.current === 'normal' || scenarioRef.current === 'timeout') setDevice(previous => ({ ...previous, receivedAt: time }));
    }, 1000);
    return () => { clearInterval(interval); if (timeout.current) clearTimeout(timeout.current); };
  }, []);
  function selectScenario(next: Scenario) {
    generation.current++; busy.current = false; setPending(false);
    if (timeout.current) clearTimeout(timeout.current);
    scenarioRef.current = next; setScenario(next);
    const time = Date.now(); setNow(time);
    if (next !== 'offline') setDevice(previous => ({ ...previous, receivedAt: next === 'stale' ? time - 18000 : time }));
    const message = { normal: 'Comunicação simulada restabelecida. Comandos cancelados não serão reaplicados.', offline: 'Sem comunicação. Controles pausados; última leitura preservada.', stale: 'Leitura desatualizada. Controles pausados até receber novos dados.', timeout: 'Cenário de teste: comandos não recebem confirmação.' }[next];
    setNotice(message); log(message);
  }
  function send(command: Command) {
    if (busy.current || connectionState(scenarioRef.current, device.receivedAt, Date.now()) !== 'online') return;
    busy.current = true; setPending(true);
    const revision = generation.current, label = describeCommand(command);
    setNotice(`${label}: aguardando confirmação simulada…`); log(`${label}: solicitado.`);
    const fails = scenarioRef.current === 'timeout';
    timeout.current = setTimeout(() => {
      if (generation.current !== revision) return;
      busy.current = false; setPending(false);
      if (fails) { setNotice('Não confirmado. O estado anterior foi preservado.'); log(`${label}: sem confirmação após 5 s.`, 'error'); return; }
      setDevice(previous => applyCommand(previous, command));
      setNotice(`${label}: confirmado na simulação.`); log(`${label}: confirmado na simulação.`, 'success');
    }, fails ? 5000 : 650);
  }
  function reset() {
    generation.current++; if (timeout.current) clearTimeout(timeout.current);
    busy.current = false; setPending(false); scenarioRef.current = 'normal'; setScenario('normal');
    setDevice(initialState()); setNow(Date.now()); setLogs([]); setNotice('Simulação reiniciada. Luz em 65% e indicador azul.');
  }
  return { device, scenario, now, pending, notice, logs, selectScenario, send, reset, connection: connectionState(scenario, device.receivedAt, now) };
}
