/* Contador de visitas do portfólio (anônimo: sem cookie, sem IP, sem nome).
   Conta: páginas vistas, vídeos abertos e cliques em links de contato.
   Os números aparecem no painel, em "Portfólio".
   Pra não contar as suas próprias visitas: abra uma vez o site com ?naocontar=1 */
(function () {
  try {
    var URL_FUNCAO = "https://kiajlqrkyfnkwwkomwyw.supabase.co/functions/v1/site-track";
    var q = new URLSearchParams(location.search);
    if (q.get("naocontar") === "1") localStorage.setItem("yc_naocontar", "1");
    if (q.get("naocontar") === "0") localStorage.removeItem("yc_naocontar");
    if (localStorage.getItem("yc_naocontar") === "1") return;
    if (window.top !== window) return; // aberto dentro do painel: não conta
    if (/bot|crawl|spider|headless|lighthouse/i.test(navigator.userAgent)) return;

    var aleatorio = function () { return Math.random().toString(36).slice(2, 12); };
    var v = localStorage.getItem("yc_v") || aleatorio();
    localStorage.setItem("yc_v", v);
    var s = sessionStorage.getItem("yc_s") || aleatorio();
    sessionStorage.setItem("yc_s", s);

    var envia = function (d) {
      d.v = v; d.s = s; d.p = location.pathname; d.w = window.innerWidth;
      var corpo = JSON.stringify(d);
      if (navigator.sendBeacon) navigator.sendBeacon(URL_FUNCAO, corpo);
      else fetch(URL_FUNCAO, { method: "POST", body: corpo, keepalive: true });
    };

    var ref = "";
    try { ref = document.referrer ? new URL(document.referrer).hostname : ""; } catch (e) {}
    if (ref === location.hostname) ref = "";
    envia({ t: "view", r: ref, u: q.get("utm_source") || "" });

    // Vídeo aberto (cartões com data-video) ou clique em link pra fora do site.
    document.addEventListener("click", function (e) {
      var alvo = e.target && e.target.closest ? e.target : null;
      if (!alvo) return;
      var card = alvo.closest("[data-video]");
      if (card) { envia({ t: "video", a: card.getAttribute("data-video"), l: card.getAttribute("data-titulo") || "" }); return; }
      var a = alvo.closest("a[href]");
      if (!a) return;
      // Espera o próprio site montar o link (ex: WhatsApp com a mensagem pronta).
      setTimeout(function () {
        var u;
        try { u = new URL(a.href); } catch (err) { return; }
        var tipo = u.protocol === "mailto:" ? "email"
          : u.protocol === "tel:" ? "telefone"
          : /(^|\.)wa\.me$|whatsapp\.com$/.test(u.hostname) ? "whatsapp"
          : u.hostname === location.hostname ? "" : u.hostname.replace(/^www\./, "");
        if (!tipo) return;
        envia({ t: "click", a: tipo, l: (a.getAttribute("data-servico") || a.textContent || "").trim().slice(0, 80) });
      }, 0);
    }, true);
  } catch (e) { /* o contador nunca pode atrapalhar o site */ }
})();
