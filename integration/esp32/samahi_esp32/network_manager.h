#pragma once
#include <Preferences.h>
#include <WebServer.h>
#include <esp_system.h>
#include "network_config.h"

// Portal de rede separado dos controles; nenhuma rota HTTP comanda os GPIOs.
namespace SamahiNetwork {
WebServer portal(80);
Preferences prefs;
String ssid, password, token;
IPAddress notebookSta, notebookAp(192,168,4,2);
bool viaAp = true, apReady = false, applyPending = false;
uint32_t applyAt = 0, retryAt = 0;
wl_status_t previousStatus = WL_NO_SHIELD;

bool sameSubnet(IPAddress a, IPAddress b, IPAddress mask) {
  return ((uint32_t)a & (uint32_t)mask) == ((uint32_t)b & (uint32_t)mask);
}
bool privateIp(IPAddress ip) {
  return ip[0] == 10 || (ip[0] == 192 && ip[1] == 168) ||
      (ip[0] == 172 && ip[1] >= 16 && ip[1] <= 31);
}
bool usableIp(IPAddress ip) {
  return privateIp(ip) && ip[3] != 0 && ip[3] != 255;
}
String escapeHtml(String s) {
  s.replace("&", "&amp;"); s.replace("<", "&lt;"); s.replace(">", "&gt;");
  s.replace("\"", "&quot;"); s.replace("'", "&#39;"); return s;
}
bool authenticated(bool post = false) {
  portal.sendHeader("Cache-Control", "no-store");
  portal.sendHeader("X-Content-Type-Options", "nosniff");
  if (!portal.authenticate("admin", AP_SENHA)) {
    portal.requestAuthentication(); return false;
  }
  if (post && (!portal.hasArg("token") || portal.arg("token") != token)) {
    portal.send(403, "text/plain; charset=utf-8", "Reabra a pagina antes de salvar."); return false;
  }
  return true;
}
bool saveConfig() {
  // Um unico valor NVS evita credenciais novas com IPs antigos em queda de energia.
  String packed = ssid + "\n" + password + "\n" + notebookSta.toString() + "\n" +
      notebookAp.toString() + "\n" + (viaAp ? "ap" : "wifi");
  if (!prefs.begin("samahi-net", false)) return false;
  bool ok = prefs.putString("config", packed) > 0;
  prefs.end(); return ok;
}
void loadConfig() {
  ssid = WIFI_NOME; password = WIFI_SENHA; notebookSta = IP_PC;
  if (!prefs.begin("samahi-net", true)) return;
  String packed = prefs.getString("config", ""); prefs.end();
  int p[4], start = 0;
  for (int i=0; i<4; i++) { p[i] = packed.indexOf('\n', start); if (p[i]<0) return; start=p[i]+1; }
  IPAddress sta, ap;
  String mode = packed.substring(p[3]+1);
  if (!sta.fromString(packed.substring(p[1]+1,p[2])) || !usableIp(sta) ||
      !ap.fromString(packed.substring(p[2]+1,p[3])) || !usableIp(ap) ||
      (mode!="ap" && mode!="wifi")) return;
  ssid=packed.substring(0,p[0]); password=packed.substring(p[0]+1,p[1]);
  notebookSta=sta; notebookAp=ap; viaAp=mode=="ap";
}
bool ready() { return viaAp ? apReady : WiFi.status() == WL_CONNECTED; }
IPAddress destination() { return viaAp ? notebookAp : notebookSta; }
bool accepts(IPAddress ip) { return ready() && ip == destination(); }
void printStatus() {
  Serial.printf("Rede propria: %s | configuracao: http://%s/ | usuario admin\n", AP_NOME, WiFi.softAPIP().toString().c_str());
  Serial.printf("Wi-Fi externo: %s | IP ESP: %s\n", WiFi.status()==WL_CONNECTED ? "conectado" : "desconectado", WiFi.localIP().toString().c_str());
  Serial.printf("Node-RED: %s:4210 | caminho: %s\n", destination().toString().c_str(), viaAp ? "rede do ESP" : "Wi-Fi externo");
}
void begin() {
  loadConfig();
  token = String(esp_random(), HEX) + String(esp_random(), HEX) + String(esp_random(), HEX);
  WiFi.persistent(false);
  WiFi.mode(WIFI_AP_STA);
  WiFi.setAutoReconnect(true);
  apReady = strlen(AP_SENHA) >= 12 && strlen(AP_SENHA) <= 63 &&
      WiFi.softAPConfig(IPAddress(192,168,4,1), IPAddress(192,168,4,1), IPAddress(255,255,255,0)) &&
      WiFi.softAP(AP_NOME, AP_SENHA);
  if (!apReady) Serial.println("Falha ao criar AP: conferir network_config.h (senha de 12 a 63 caracteres).");
  portal.on("/", HTTP_GET, []() {
    if (!authenticated()) return;
    String page = F("<!doctype html><html lang='pt-BR'><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Rede SAMAHI</title><style>body{font:16px system-ui;max-width:620px;margin:32px auto;padding:16px;background:#f4f7fa;color:#172b3a}input,select,button{font:inherit;padding:10px;box-sizing:border-box;width:100%;margin:6px 0 16px}button{background:#145f72;color:white;border:0;border-radius:6px}label{display:block}small{display:block}</style><h1>Rede SAMAHI</h1><p>A rede propria continua ativa. Telefone e notebook devem usar a mesma rede para acessar o app.</p><form method='post' action='/salvar'><input type='hidden' name='token' value='");
    page += token + "'><label>Nome do Wi-Fi externo<input name='ssid' maxlength='32' value='" + escapeHtml(ssid) + "'></label>";
    page += F("<label>Senha do Wi-Fi<input type='password' name='password' maxlength='63' autocomplete='new-password'></label><small>Deixe a senha vazia para manter a atual. Para uma rede aberta, marque abaixo.</small><label><input style='width:auto' type='checkbox' name='open' value='1'> Wi-Fi externo sem senha</label><p>Deixe o nome vazio para desligar apenas a conexao externa.</p><label>Rede usada pelo notebook<select name='path'>");
    page += String("<option value='ap'") + (viaAp?" selected":"") + ">Rede propria do ESP</option><option value='wifi'" + (!viaAp?String(" selected"):String("")) + ">Wi-Fi externo</option></select></label>";
    page += "<label>IP do notebook na rede do ESP<input name='apPc' required value='" + notebookAp.toString() + "'></label>";
    page += "<label>IP do notebook no Wi-Fi externo<input name='staPc' required value='" + notebookSta.toString() + "'></label>";
    page += F("<button>Salvar configuracao</button></form><p>Use os IPs mostrados no console do notebook. O endereco do app e o do notebook com a porta 3002.</p><h2>Estado</h2><p>");
    page += "Wi-Fi externo: " + String(WiFi.status()==WL_CONNECTED?"conectado":"desconectado") + "<br>IP ESP externo: " + WiFi.localIP().toString() + "<br>IP ESP proprio: " + WiFi.softAPIP().toString();
    page += F("</p><p>A configuracao fica salva ao desligar. Senhas nao sao exibidas nesta pagina.</p></html>");
    portal.send(200, "text/html; charset=utf-8", page);
  });
  portal.on("/salvar", HTTP_POST, []() {
    if (!authenticated(true)) return;
    String nextSsid=portal.arg("ssid"), nextPassword=portal.arg("password"), path=portal.arg("path");
    IPAddress sta, ap;
    bool open=portal.arg("open")=="1";
    if (nextSsid.length()>32 || nextSsid.indexOf('\n')>=0 || nextSsid.indexOf('\r')>=0 ||
        nextPassword.indexOf('\n')>=0 || nextPassword.indexOf('\r')>=0 ||
        nextPassword.length()>63 || (nextPassword.length()>0 && nextPassword.length()<8) ||
        (path!="ap" && path!="wifi") || (path=="wifi" && nextSsid.isEmpty()) ||
        !sta.fromString(portal.arg("staPc")) || !usableIp(sta) ||
        !ap.fromString(portal.arg("apPc")) || !usableIp(ap) || ap==WiFi.softAPIP() ||
        !sameSubnet(ap, WiFi.softAPIP(), IPAddress(255,255,255,0))) {
      portal.send(400,"text/plain; charset=utf-8","Dados invalidos. Confira SSID, senha (8 a 63), caminho e IPs privados. IP AP deve estar na sub-rede do ESP."); return;
    }
    if (!open && nextPassword.isEmpty() && nextSsid!=ssid && !nextSsid.isEmpty()) {
      portal.send(400,"text/plain; charset=utf-8","Informe a senha da nova rede ou marque rede aberta."); return;
    }
    String oldSsid=ssid, oldPassword=password; IPAddress oldSta=notebookSta, oldAp=notebookAp; bool oldPath=viaAp;
    ssid=nextSsid; if (open) password=""; else if (!nextPassword.isEmpty()) password=nextPassword;
    notebookSta=sta; notebookAp=ap; viaAp=path=="ap";
    if (!saveConfig()) {
      ssid=oldSsid; password=oldPassword; notebookSta=oldSta; notebookAp=oldAp; viaAp=oldPath;
      portal.send(500,"text/plain; charset=utf-8","Nao foi possivel persistir. Configuracao anterior mantida."); return;
    }
    applyPending=true; applyAt=millis();
    portal.send(200,"text/html; charset=utf-8","<meta charset='utf-8'><p>Configuracao salva. Aguarde a reconexao do Wi-Fi externo. A rede propria permanece ativa.</p><a href='/'>Voltar</a>");
  });
  portal.onNotFound([](){ if (authenticated()) portal.send(404,"text/plain","Rota inexistente"); });
  portal.begin();
  if (!ssid.isEmpty()) WiFi.begin(ssid.c_str(),password.c_str());
  printStatus();
}
void tick() {
  portal.handleClient();
  uint32_t now=millis();
  if (applyPending && now-applyAt>=500) {
    applyPending=false;
    WiFi.disconnect(false, false); // nao desliga o radio nem o AP.
    if (!ssid.isEmpty()) WiFi.begin(ssid.c_str(), password.c_str());
    retryAt=now; printStatus();
  }
  if (WiFi.status()!=previousStatus) {
    previousStatus=WiFi.status();
    // AP e STA compartilham radio. Evitar a mesma sub-rede nas duas interfaces.
    if (previousStatus==WL_CONNECTED && sameSubnet(WiFi.softAPIP(), WiFi.localIP(), WiFi.subnetMask())) {
      IPAddress replacement=WiFi.localIP()[0]==10 ? IPAddress(192,168,50,1) : IPAddress(10,42,0,1);
      if (WiFi.softAPConfig(replacement,replacement,IPAddress(255,255,255,0))) {
        notebookAp=IPAddress(replacement[0],replacement[1],replacement[2],2);
        saveConfig();
        Serial.println("Sub-rede AP alterada para evitar conflito. Reconecte notebook/telefone e ajuste o IP do notebook no portal.");
      }
    }
    printStatus();
  }
  if (!applyPending && !ssid.isEmpty() && WiFi.status()!=WL_CONNECTED && now-retryAt>=20000) {
    retryAt=now; WiFi.reconnect();
  }
}
}
