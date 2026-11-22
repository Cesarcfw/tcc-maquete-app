#pragma once
#include "gas_alarm.h"
// Testes do mesmo codigo de producao, executados pelo compilador, sem GPIOs.
namespace SamahiAlarmChecks {
using namespace SamahiAlarm;
constexpr State one = update(State{},500,true,2000,2000);
constexpr State triggered = update(one,500,true,4000,4000);
static_assert(!one.active && triggered.active,"Duas avaliacoes >=500 sao necessarias");
static_assert(!update(one,499,true,4000,4000).active,"Abaixo de 500 interrompe confirmacao");
static_assert(!update(one,900,true,2000,4000).active,"Nao contar a mesma amostra duas vezes");
static_assert(!update(one,900,true,8000,8000).active,"Lacuna interrompe confirmacao");
constexpr State band = update(triggered,400,true,6000,6000);
constexpr State low1 = update(band,300,true,8000,8000);
constexpr State low2 = update(low1,300,true,10000,10000);
constexpr State cleared = update(low2,300,true,12000,12000);
static_assert(band.active && low1.active && low2.active && !cleared.active,"Histerese e tres avaliacoes <=300");
static_assert(update(low2,301,true,12000,12000).active,"301 interrompe encerramento");
static_assert(update(triggered,4095,true,6000,6000).active,"Saturacao nao encerra alerta");
static_assert(update(triggered,200,false,6000,6000).fault,"Ausencia de amostra sinaliza falha");
static_assert(update(triggered,200,true,4000,10000).active,"Amostra antiga nao encerra alerta");
static_assert(update(triggered,200,true,4000,10000).fault,"Idade invalida sinaliza falha");
constexpr State wrappedStart{false,false,true,1,0,0xfffffc00u,0xfffffc00u};
static_assert(update(wrappedStart,600,true,2000,2000).active,"Contagem funciona ao dar volta em millis");
static_assert(visibleColor(2,4,1,true,true)==2,"Preserva cor escolhida na fase ligada");
static_assert(visibleColor(2,4,1,true,false)==4,"Fase apagada independente da cor escolhida");
static_assert(visibleColor(4,4,1,true,true)==1,"Triagem apagada usa amarelo temporario");
static_assert(visibleColor(4,4,1,false,true)==4,"Apos alerta restaura apagado");
static_assert(visibleColor(3,4,1,false,true)==3,"Apos alerta restaura cor escolhida");
static_assert(blinkPhase(0,0) && blinkPhase(0,299) && !blinkPhase(0,300),"Pisca ligado por 300 ms");
static_assert(!blinkPhase(0,599) && blinkPhase(0,600),"Pisca apagado por 300 ms e repete");
static_assert(blinkPhase(0xfffffff0u,0x20u),"Pisca suporta volta de millis");
}
