import React, { useState, useRef, useEffect } from "react";
import { sleep, emitToast, callClaude, parseJSON, getApiKey, setApiKey } from "./api.js";

/* ─── GLOBAL STYLES ─────────────────────────────────────────────────────── */
const S = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#080c14;--sf:#0e1520;--sf2:#141d2e;--bd:#1e2d45;--ac:#00d4ff;--ac2:#7c3aed;--ac3:#10b981;--tx:#e2eaf6;--mu:#5a7099;--re:#f87171;--wa:#fbbf24}
body{background:var(--bg);color:var(--tx);font-family:'Syne',sans-serif;min-height:100vh}
.app{min-height:100vh;background:var(--bg);background-image:radial-gradient(ellipse 80% 50% at 20% -10%,rgba(0,212,255,.08),transparent 60%),radial-gradient(ellipse 60% 40% at 80% 110%,rgba(124,58,237,.08),transparent 60%)}
@keyframes up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
.hdr{border-bottom:1px solid var(--bd);padding:11px 22px;display:flex;align-items:center;justify-content:space-between;background:rgba(14,21,32,.95);backdrop-filter:blur(12px);position:sticky;top:0;z-index:100;flex-wrap:wrap;gap:8px}
.logo{display:flex;align-items:center;gap:9px}
.logo-ic{width:30px;height:30px;background:linear-gradient(135deg,var(--ac),var(--ac2));border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:14px}
.logo-tx{font-size:15px;font-weight:800;letter-spacing:-.5px}.logo-tx span{color:var(--ac)}
.tabs{display:flex;gap:2px;background:var(--sf);border-radius:9px;padding:3px;border:1px solid var(--bd);flex-wrap:wrap}
.tab{padding:6px 12px;border-radius:6px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-size:11px;font-weight:600;transition:all .18s;color:var(--mu);background:transparent;white-space:nowrap}
.tab.on{background:var(--ac);color:#000}.tab:hover:not(.on){color:var(--tx);background:var(--sf2)}
.wrap{max-width:1020px;margin:0 auto;padding:36px 18px}
.ttl{font-size:27px;font-weight:800;line-height:1.1;margin-bottom:6px;letter-spacing:-1px}.ttl span{color:var(--ac)}
.sub{color:var(--mu);font-size:12px;margin-bottom:26px;font-family:'Space Mono',monospace}
.card{background:var(--sf);border:1px solid var(--bd);border-radius:12px;padding:16px}
.bx{background:var(--sf);border:1px solid var(--bd);border-radius:13px;padding:20px}
.lbl{font-size:10px;font-weight:700;color:var(--mu);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;display:block}
.inp,.sel,.txa{background:var(--sf);border:1px solid var(--bd);border-radius:8px;color:var(--tx);font-family:'Syne',sans-serif;font-size:13px;padding:9px 12px;outline:none;transition:border-color .2s;width:100%}
.inp:focus,.sel:focus,.txa:focus{border-color:var(--ac)}.sel{cursor:pointer}.sel option{background:#0e1520}.txa{resize:vertical;min-height:90px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:13px}.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
@media(max-width:640px){.g2,.g3{grid-template-columns:1fr}}
.pbtn{width:100%;padding:13px;border-radius:11px;border:none;background:linear-gradient(135deg,var(--ac),#0099bb);color:#000;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px}
.pbtn:disabled{opacity:.4;cursor:not-allowed}.pbtn:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 7px 24px rgba(0,212,255,.3)}
.pbtn.pu{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff}.pbtn.pu:not(:disabled):hover{box-shadow:0 7px 24px rgba(124,58,237,.35)}
.pbtn.pg{background:linear-gradient(135deg,#10b981,#059669);color:#fff}.pbtn.pg:not(:disabled):hover{box-shadow:0 7px 24px rgba(16,185,129,.35)}
.obtn{background:var(--sf2);border:1px solid var(--bd);color:var(--mu);border-radius:7px;padding:6px 13px;cursor:pointer;font-family:'Syne',sans-serif;font-size:12px;font-weight:600;transition:all .15s}
.obtn:hover{border-color:var(--ac);color:var(--ac)}
.tag-bx{background:var(--sf);border:1px solid var(--bd);border-radius:11px;padding:9px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-height:46px;transition:border-color .2s;margin-bottom:9px}
.tag-bx:focus-within{border-color:var(--ac)}
.tag{background:rgba(0,212,255,.12);border:1px solid rgba(0,212,255,.3);color:var(--ac);border-radius:5px;padding:3px 8px;font-size:11px;font-weight:600;display:flex;align-items:center;gap:4px;font-family:'Space Mono',monospace}
.tag button{background:none;border:none;color:var(--ac);cursor:pointer;font-size:13px;opacity:.6}.tag button:hover{opacity:1}
.ti{background:transparent;border:none;outline:none;color:var(--tx);font-family:'Syne',sans-serif;font-size:13px;min-width:110px;flex:1}.ti::placeholder{color:var(--mu)}
.chips{display:flex;flex-wrap:wrap;gap:5px}
.chip{background:var(--sf2);border:1px solid var(--bd);color:var(--mu);border-radius:5px;padding:3px 8px;font-size:11px;cursor:pointer;transition:all .15s;font-family:'Space Mono',monospace}
.chip:hover{border-color:var(--ac);color:var(--ac)}.chip.on{border-color:var(--ac3);color:var(--ac3);background:rgba(16,185,129,.1)}
.pill{font-size:10px;font-family:'Space Mono',monospace;padding:2px 6px;border-radius:3px}
.pb{background:rgba(0,212,255,.1);color:var(--ac);border:1px solid rgba(0,212,255,.2)}
.pr{background:rgba(248,113,113,.1);color:var(--re);border:1px solid rgba(248,113,113,.2)}
.pp{background:rgba(124,58,237,.1);color:#a78bfa;border:1px solid rgba(124,58,237,.2)}
.bdg{font-size:10px;font-weight:700;font-family:'Space Mono',monospace;padding:2px 8px;border-radius:14px;white-space:nowrap}
.bg{background:rgba(16,185,129,.15);color:var(--ac3);border:1px solid rgba(16,185,129,.3)}
.bw{background:rgba(251,191,36,.15);color:var(--wa);border:1px solid rgba(251,191,36,.3)}
.br{background:rgba(248,113,113,.15);color:var(--re);border:1px solid rgba(248,113,113,.3)}
.bb{background:rgba(0,212,255,.12);color:var(--ac);border:1px solid rgba(0,212,255,.25)}
.MUST{background:rgba(248,113,113,.15);color:var(--re);border:1px solid rgba(248,113,113,.3)}
.GOOD{background:rgba(251,191,36,.15);color:var(--wa);border:1px solid rgba(251,191,36,.3)}
.BONUS{background:rgba(16,185,129,.15);color:var(--ac3);border:1px solid rgba(16,185,129,.3)}
.prog{background:var(--sf2);border-radius:99px;height:5px;overflow:hidden;margin-bottom:12px}
.pf{height:100%;border-radius:99px;transition:width .4s ease}
.ld{display:flex;flex-direction:column;align-items:center;padding:56px 0;gap:14px}
.ring{width:38px;height:38px;border-radius:50%;border:3px solid var(--bd);border-top-color:var(--ac);animation:spin .8s linear infinite}
.rsm{width:16px;height:16px;border-width:2px;border-top-color:currentColor;display:inline-block;border-radius:50%;border-style:solid;border-color:rgba(0,0,0,.2) rgba(0,0,0,.2) rgba(0,0,0,.2) currentColor;animation:spin .8s linear infinite}
.err{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.3);border-radius:8px;padding:11px;color:var(--re);font-size:12px;margin-top:12px;line-height:1.5}
.div{border:none;border-top:1px solid var(--bd);margin:24px 0}
.stg{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:9px;margin-bottom:22px}
.sc{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:12px;text-align:center}
.sn{font-size:20px;font-weight:800;font-family:'Space Mono',monospace;color:var(--ac)}.sl{font-size:10px;color:var(--mu);margin-top:2px}
.fa{animation:up .38s ease forwards;opacity:0}
.up-z{border:2px dashed var(--bd);border-radius:13px;padding:46px 32px;text-align:center;background:var(--sf);transition:all .2s;cursor:pointer}
.up-z:hover,.up-z.drag{border-color:var(--ac);background:rgba(0,212,255,.04)}
.co-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
.co-c{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:12px 9px;text-align:center;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:6px}
.co-c:hover{border-color:var(--ac);transform:translateY(-2px);background:var(--sf2)}.co-c.on{border-color:var(--ac);background:rgba(0,212,255,.07)}
.cl{font-size:10px;font-weight:700;color:var(--mu);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;font-family:'Space Mono',monospace;display:flex;align-items:center;gap:7px}
.cl::after{content:'';flex:1;height:1px;background:var(--bd)}
.sg{display:grid;grid-template-columns:1fr 1fr;gap:13px}.fw{grid-column:1/-1}
@media(max-width:640px){.sg{grid-template-columns:1fr}}
.mi{display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;padding:9px 10px;background:var(--sf2);border-radius:7px;border-left:3px solid var(--ac)}
.ri{display:flex;gap:10px;margin-bottom:8px;align-items:flex-start}
.rn{width:21px;height:21px;border-radius:50%;background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.3);color:var(--ac);font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Space Mono',monospace}
.sr{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--bd)}.sr:last-child{border-bottom:none}
.rm-ph{display:flex;align-items:center;gap:11px;margin-bottom:12px;padding:11px 14px;border-radius:9px;border:1px solid var(--bd)}
.wg{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:11px}
.wc{background:var(--sf);border:1px solid var(--bd);border-radius:11px;padding:14px;position:relative;overflow:hidden;animation:up .38s ease forwards;opacity:0}
.wc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--wcc,var(--ac))}
.wc li{font-size:11px;color:var(--mu);padding:3px 0;border-bottom:1px solid var(--bd);display:flex;align-items:flex-start;gap:5px;line-height:1.4;list-style:none}.wc li:last-child{border-bottom:none}
.dt{width:4px;height:4px;border-radius:50%;flex-shrink:0;margin-top:5px}
.rr{display:flex;align-items:flex-start;gap:12px;padding:13px 14px;background:var(--sf);border:1px solid var(--bd);border-radius:10px;margin-bottom:9px;animation:up .38s ease forwards;opacity:0}
.rrn{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.3);color:var(--ac);font-family:'Space Mono',monospace}
.dg{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:9px;margin-top:12px}
.dc{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:13px;animation:up .38s ease forwards;opacity:0}
.miq{background:var(--sf);border:1px solid var(--bd);border-radius:13px;padding:20px;animation:up .35s ease forwards}
.mifb{background:rgba(124,58,237,.07);border:1px solid rgba(124,58,237,.25);border-radius:13px;padding:18px;animation:up .35s ease forwards}
.mir{background:var(--sf);border:1px solid var(--bd);border-radius:11px;padding:14px;margin-bottom:9px}
.aqq{background:var(--sf);border:1px solid var(--bd);border-radius:13px;padding:20px;animation:up .3s ease forwards}
.aop{padding:11px 14px;border-radius:9px;border:1px solid var(--bd);background:var(--sf2);color:var(--tx);cursor:pointer;font-family:'Syne',sans-serif;font-size:13px;font-weight:600;transition:all .15s;text-align:left;width:100%;margin-bottom:7px}
.aop:hover:not(:disabled){border-color:var(--ac3);color:var(--ac3)}.aop.ch{border-color:var(--ac);background:rgba(0,212,255,.08);color:var(--ac)}
.aop.ok{border-color:var(--ac3)!important;background:rgba(16,185,129,.12)!important;color:var(--ac3)!important}
.aop.no{border-color:var(--re)!important;background:rgba(248,113,113,.08)!important;color:var(--re)!important}
.aop:disabled{cursor:default}
.atm{font-size:17px;font-weight:800;font-family:'Space Mono',monospace;color:var(--wa);padding:5px 12px;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.25);border-radius:7px}
.atm.red{color:var(--re);background:rgba(248,113,113,.1);border-color:rgba(248,113,113,.25)}
.aqr{background:var(--sf);border:1px solid var(--bd);border-radius:13px;padding:26px;text-align:center;animation:up .4s ease forwards}
.abig{font-size:54px;font-weight:800;font-family:'Space Mono',monospace}
.arv{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:16px}
@media(max-width:580px){.arv{grid-template-columns:1fr}}
.arc{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:13px;animation:up .4s ease forwards;opacity:0}

/* ── RESUME BUILDER ── */
.rb-steps{display:flex;gap:0;margin-bottom:28px;overflow-x:auto}
.rb-step{display:flex;align-items:center;gap:0;flex-shrink:0}
.rb-step-dot{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;font-family:'Space Mono',monospace;border:2px solid var(--bd);background:var(--sf2);color:var(--mu);transition:all .2s;flex-shrink:0}
.rb-step-dot.done{background:var(--ac3);border-color:var(--ac3);color:#000}
.rb-step-dot.active{background:var(--ac);border-color:var(--ac);color:#000}
.rb-step-label{font-size:11px;font-weight:600;color:var(--mu);margin:0 8px;white-space:nowrap}
.rb-step-label.active{color:var(--ac)}
.rb-step-label.done{color:var(--ac3)}
.rb-step-line{width:32px;height:2px;background:var(--bd);flex-shrink:0}
.rb-step-line.done{background:var(--ac3)}
.rb-section{background:var(--sf);border:1px solid var(--bd);border-radius:13px;padding:20px;margin-bottom:14px;animation:up .35s ease forwards}
.rb-section-ttl{font-size:13px;font-weight:800;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.rb-add-btn{background:rgba(0,212,255,.08);border:1px dashed rgba(0,212,255,.35);color:var(--ac);border-radius:8px;padding:9px;width:100%;cursor:pointer;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;margin-top:10px;transition:all .15s}
.rb-add-btn:hover{background:rgba(0,212,255,.14)}
.rb-item{background:var(--sf2);border:1px solid var(--bd);border-radius:9px;padding:13px;margin-bottom:9px;position:relative}
.rb-item-del{position:absolute;top:10px;right:10px;background:none;border:none;color:var(--mu);cursor:pointer;font-size:15px;line-height:1}
.rb-item-del:hover{color:var(--re)}
.rb-skill-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.rb-skill-tag{background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.25);color:var(--ac);border-radius:5px;padding:3px 9px;font-size:11px;font-family:'Space Mono',monospace;display:flex;align-items:center;gap:4px}
.rb-skill-tag button{background:none;border:none;color:var(--ac);cursor:pointer;font-size:12px;opacity:.6}
.rb-skill-tag button:hover{opacity:1}
.rb-nav{display:flex;justify-content:space-between;margin-top:20px;gap:10px}

/* RESUME PREVIEW */
.resume-preview{background:#fff;color:#111;border-radius:12px;padding:40px 44px;font-family:'Georgia',serif;line-height:1.6;animation:up .4s ease forwards;box-shadow:0 4px 40px rgba(0,0,0,.3)}
.resume-preview *{box-sizing:border-box}
.rp-name{font-size:26px;font-weight:800;font-family:'Arial',sans-serif;color:#111;margin-bottom:3px;letter-spacing:-.5px}
.rp-contact{font-size:12px;color:#555;font-family:'Arial',sans-serif;margin-bottom:16px;display:flex;flex-wrap:wrap;gap:4px 14px}
.rp-contact span::before{content:'• ';opacity:.4}
.rp-contact span:first-child::before{content:''}
.rp-divider{border:none;border-top:2px solid #111;margin:12px 0 10px}
.rp-section-head{font-size:13px;font-weight:800;font-family:'Arial',sans-serif;color:#111;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;margin-top:16px}
.rp-section-head:first-of-type{margin-top:0}
.rp-summary{font-size:13px;color:#333;line-height:1.6;margin-bottom:4px}
.rp-job-row{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:4px}
.rp-job-title{font-size:13px;font-weight:700;font-family:'Arial',sans-serif;color:#111}
.rp-job-date{font-size:11px;color:#777;font-family:'Arial',sans-serif;white-space:nowrap}
.rp-job-co{font-size:12px;color:#444;font-family:'Arial',sans-serif;margin-bottom:5px;font-style:italic}
.rp-bullet{font-size:12px;color:#333;padding-left:14px;position:relative;margin-bottom:3px;line-height:1.5}
.rp-bullet::before{content:'•';position:absolute;left:0;color:#555}
.rp-edu-row{display:flex;justify-content:space-between;flex-wrap:wrap;gap:3px;margin-bottom:3px}
.rp-edu-deg{font-size:13px;font-weight:700;font-family:'Arial',sans-serif}
.rp-edu-date{font-size:11px;color:#777;font-family:'Arial',sans-serif}
.rp-edu-school{font-size:12px;color:#444;font-style:italic}
.rp-proj-name{font-size:13px;font-weight:700;font-family:'Arial',sans-serif;margin-bottom:3px}
.rp-proj-desc{font-size:12px;color:#333;line-height:1.5;margin-bottom:3px}
.rp-skills-row{display:flex;flex-wrap:wrap;gap:3px 10px;font-size:12px;color:#333}
.rp-skills-row span::after{content:' ·';opacity:.4}
.rp-skills-row span:last-child::after{content:''}
.rb-dl-btn{width:100%;padding:13px;border-radius:11px;border:none;background:linear-gradient(135deg,var(--ac3),#059669);color:#fff;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px}
.rb-dl-btn:hover{box-shadow:0 7px 24px rgba(16,185,129,.35);transform:translateY(-1px)}
.rb-regen-btn{width:100%;padding:11px;border-radius:11px;border:1px solid var(--bd);background:var(--sf2);color:var(--mu);font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px}
.rb-regen-btn:hover{border-color:var(--ac);color:var(--ac)}

.toast{position:fixed;bottom:22px;right:22px;background:#1a2540;border:1px solid var(--ac);border-radius:9px;padding:10px 16px;font-size:11px;font-family:'Space Mono',monospace;color:var(--ac);z-index:9999;animation:up .3s ease;display:flex;align-items:center;gap:9px;box-shadow:0 6px 28px rgba(0,0,0,.5);max-width:320px}
`;

/* ─── API provided via ./api.js ─── */

function Spin({ c = "#000" }) {
  return <span className="rsm" style={{ borderLeftColor: c }} />;
}

function scColor(s) {
  return s >= 8 ? "var(--ac3)" : s >= 5 ? "var(--wa)" : "var(--re)";
}

/* ─── DATA ──────────────────────────────────────────────────────────────── */
const SKILLS = ["Python","JavaScript","React","Machine Learning","SQL","Java","Node.js","AWS","Docker","Data Analysis","TensorFlow","Figma","C++","NLP","Django","MongoDB","Flutter","Kubernetes","TypeScript","Spring Boot"];

const COS = {
  "Indian IT Giants":[{n:"TCS",e:"🔵",t:"IT Services"},{n:"Infosys",e:"🟦",t:"IT Services"},{n:"Wipro",e:"⚙️",t:"IT Services"},{n:"HCL Tech",e:"🟩",t:"IT Services"},{n:"Tech Mahindra",e:"🌐",t:"IT Services"},{n:"Cognizant",e:"🔷",t:"IT Services"}],
  "Product Companies":[{n:"Zoho",e:"🟠",t:"SaaS"},{n:"Freshworks",e:"🌿",t:"SaaS"},{n:"Razorpay",e:"💙",t:"Fintech"},{n:"CRED",e:"🖤",t:"Fintech"},{n:"Chargebee",e:"⚡",t:"SaaS"},{n:"Zepto",e:"🟡",t:"Q-Commerce"}],
  "MNCs & Big Tech":[{n:"Accenture",e:"🔺",t:"Consulting"},{n:"Capgemini",e:"🌊",t:"Consulting"},{n:"Deloitte",e:"🟢",t:"Consulting"},{n:"IBM",e:"💙",t:"Tech MNC"},{n:"Microsoft",e:"🪟",t:"Big Tech"},{n:"Amazon",e:"📦",t:"Big Tech"},{n:"Google",e:"🎨",t:"Big Tech"},{n:"Samsung R&D",e:"📱",t:"Consumer Tech"}],
  "Startups & Unicorns":[{n:"PhonePe",e:"💜",t:"Fintech"},{n:"Swiggy",e:"🍊",t:"FoodTech"},{n:"Ola",e:"🟡",t:"Mobility"},{n:"Paytm",e:"💙",t:"Fintech"},{n:"Meesho",e:"🛍️",t:"E-Commerce"},{n:"BYJU'S",e:"🎓",t:"EdTech"}],
};
const ALL_COS = Object.values(COS).flat().map(c => c.n);
const CO_E = Object.fromEntries(Object.values(COS).flat().map(c => [c.n, c.e]));
const PH_COLS = ["#00d4ff","#7c3aed","#10b981","#fbbf24","#f87171"];
const MI_ROUNDS = ["Aptitude / Online Test","Technical Round 1","Technical Round 2","HR Round"];
const AQ_CATS = ["Quantitative Aptitude","Logical Reasoning","Verbal Ability","Data Interpretation","Coding MCQ","General Awareness"];

/* ════════════════════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════════════════════ */
function Toast() {
  const [msg, setMsg] = useState("");
  const t = useRef(null);
  useEffect(() => {
    const h = e => { setMsg(e.detail); clearTimeout(t.current); t.current = setTimeout(() => setMsg(""), 5000); };
    window.addEventListener("ai-toast", h);
    return () => window.removeEventListener("ai-toast", h);
  }, []);
  if (!msg) return null;
  return <div className="toast"><span className="ring" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: "var(--ac)" }} />{msg}</div>;
}

/* ════════════════════════════════════════════════════════════════════════
   1. SKILL MATCHER
════════════════════════════════════════════════════════════════════════ */
function SkillMatcher() {
  const [skills, setSkills] = useState([]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [err, setErr] = useState("");

  const add = s => { const t = s.trim(); if (t && !skills.includes(t)) setSkills(p => [...p, t]); setInp(""); };
  const onKey = e => {
    if ((e.key === "Enter" || e.key === ",") && inp.trim()) { e.preventDefault(); add(inp); }
    if (e.key === "Backspace" && !inp && skills.length) setSkills(p => p.slice(0, -1));
  };

  const analyze = async () => {
    setLoading(true); setErr(""); setResults(null);
    try {
      const raw = await callClaude(
        [{ role: "user", content: "My skills: " + skills.join(", ") }],
        "Career placement expert. Return JSON array of exactly 4 roles: [{\"role\":string,\"match\":number 0-100,\"description\":string,\"matchedSkills\":string[],\"missingSkills\":string[],\"learningPath\":string[]}]. ONLY valid JSON array."
      );
      setResults(parseJSON(raw));
    } catch (e) { setErr(e.message || "Analysis failed. Try again."); }
    setLoading(false);
  };

  const mc = m => m >= 70 ? "bg" : m >= 40 ? "bw" : "br";

  return (
    <div>
      <div className="ttl">Find Your <span>Perfect Role</span></div>
      <div className="sub">// Enter skills → matched roles + learning paths</div>
      <label className="lbl">Your Skills</label>
      <div className="tag-bx">
        {skills.map(s => (
          <span key={s} className="tag">{s}<button onClick={() => setSkills(p => p.filter(x => x !== s))}>×</button></span>
        ))}
        <input className="ti" value={inp} onChange={e => setInp(e.target.value)} onKeyDown={onKey}
          onBlur={() => inp.trim() && add(inp)} placeholder={skills.length ? "Add more…" : "Type skill + Enter…"} />
      </div>
      <div className="chips" style={{ marginBottom: 18 }}>
        {SKILLS.filter(s => !skills.includes(s)).map(s => (
          <button key={s} className="chip" onClick={() => add(s)}>{s}</button>
        ))}
      </div>
      <button className="pbtn" disabled={!skills.length || loading} onClick={analyze}>
        {loading ? <><Spin />Analyzing…</> : "⚡ Analyze My Skills"}
      </button>
      {err && <div className="err">{err}</div>}
      {results && (
        <div style={{ marginTop: 26 }}>
          <div className="ttl" style={{ fontSize: 20, marginBottom: 14 }}>Matched <span>Roles</span></div>
          <div className="g2">
            {results.map((r, i) => (
              <div key={i} className="card fa" style={{ animationDelay: i * 0.07 + "s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.role}</div>
                  <span className={"bdg " + mc(r.match)}>{r.match}%</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--mu)", lineHeight: 1.5, marginBottom: 9 }}>{r.description}</div>
                {r.matchedSkills?.length > 0 && (
                  <div style={{ marginBottom: 7 }}>
                    <div className="lbl" style={{ marginBottom: 4 }}>✓ Have</div>
                    <div className="chips">{r.matchedSkills.map(s => <span key={s} className="pill pb">{s}</span>)}</div>
                  </div>
                )}
                {r.missingSkills?.length > 0 && (
                  <div style={{ marginBottom: 7 }}>
                    <div className="lbl" style={{ marginBottom: 4 }}>✗ Learn</div>
                    <div className="chips">{r.missingSkills.map(s => <span key={s} className="pill pr">{s}</span>)}</div>
                  </div>
                )}
                {r.learningPath?.length > 0 && (
                  <div style={{ background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 7, padding: 9, marginTop: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>🗺 Path</div>
                    {r.learningPath.map((s, j) => (
                      <div key={j} style={{ fontSize: 11, color: "var(--mu)", display: "flex", gap: 5, marginBottom: 3 }}>
                        <span style={{ color: "#a78bfa" }}>→</span>{s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   2. ATS SCANNER
════════════════════════════════════════════════════════════════════════ */
function ATSScanner() {
  const [file, setFile] = useState(null);
  const [paste, setPaste] = useState("");
  const [mode, setMode] = useState("paste");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [results, setResults] = useState(null);
  const [err, setErr] = useState("");
  const fileRef = useRef();

  const onFile = f => { if (f) { setFile(f); setResults(null); setErr(""); } };
  const onDrop = e => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); };

  const readPDF = f => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const bytes = new Uint8Array(e.target.result);
        let out = "";
        for (let i = 0; i < bytes.length; i++) {
          const b = bytes[i];
          if (b >= 32 && b <= 126) out += String.fromCharCode(b);
          else if (b === 10 || b === 13) out += " ";
        }
        // strip PDF keywords and collapse spaces
        out = out.replace(/(endobj|endstream|xref|startxref|trailer)/g, " ").replace(/ {4,}/g, "  ").trim();
        if (out.length < 80) return reject(new Error("Could not extract text from this PDF. Please use Paste Text mode instead."));
        resolve(out.slice(0, 4000));
      } catch (ex) { reject(ex); }
    };
    reader.onerror = () => reject(new Error("File read failed."));
    reader.readAsArrayBuffer(f);
  });

  const readTXT = f => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve((e.target.result || "").slice(0, 4000));
    reader.onerror = () => reject(new Error("File read failed."));
    reader.readAsText(f);
  });

  const analyze = async () => {
    setLoading(true); setErr(""); setResults(null);
    try {
      let resumeText = "";
      if (mode === "paste") {
        resumeText = paste.trim();
        setLoadMsg("Analysing resume…");
      } else {
        setLoadMsg("Reading file…");
        const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        resumeText = isPDF ? await readPDF(file) : await readTXT(file);
        setLoadMsg("Running AI analysis…");
      }
      if (!resumeText || resumeText.length < 30) throw new Error("Resume text too short. Please paste more content.");
      const sys = "You are an expert ATS analyzer. Return ONLY raw JSON (no markdown, { to }): {\"score\":number 0-100,\"verdict\":string,\"strengths\":string[] 3-4,\"weaknesses\":string[] 3-4,\"keywordsFound\":string[] up to 8,\"keywordsMissing\":string[] up to 6,\"improvements\":string[] 4-5,\"formattingIssues\":string[] up to 4}";
      const prompt = "Resume:\n" + resumeText + "\n\nJob: " + (jobTitle || "Software/IT") + "\nJD: " + (jobDesc || "Not provided");
      const raw = await callClaude([{ role: "user", content: prompt }], sys, 1500);
      setResults(parseJSON(raw));
    } catch (e) { setErr(e.message || "Analysis failed. Please try again."); }
    setLoadMsg(""); setLoading(false);
  };

  const sc = results ? (results.score >= 75 ? "var(--ac3)" : results.score >= 50 ? "var(--wa)" : "var(--re)") : "var(--ac)";
  const canRun = mode === "paste" ? paste.trim().length > 30 : !!file;

  return (
    <div>
      <div className="ttl">ATS <span>Resume Scanner</span></div>
      <div className="sub">// Upload or paste resume → instant ATS compatibility score</div>

      <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
        {[["paste", "📋 Paste Text"], ["file", "📁 Upload File"]].map(([m, l]) => (
          <button key={m} onClick={() => { setMode(m); setErr(""); setResults(null); }}
            style={{ padding: "7px 18px", borderRadius: 7, border: "1px solid " + (mode === m ? "var(--ac)" : "var(--bd)"), background: mode === m ? "rgba(0,212,255,0.1)" : "var(--sf2)", color: mode === m ? "var(--ac)" : "var(--mu)", cursor: "pointer", fontFamily: "Syne,sans-serif", fontSize: 12, fontWeight: 700, transition: "all .15s" }}>
            {l}
          </button>
        ))}
      </div>

      {mode === "paste" ? (
        <div style={{ marginBottom: 14 }}>
          <label className="lbl">Your Resume Text</label>
          <textarea className="txa" style={{ minHeight: 200 }}
            placeholder="Paste your full resume here — name, skills, experience, education, projects, certifications…"
            value={paste} onChange={e => setPaste(e.target.value)} />
          <div style={{ fontSize: 11, color: "var(--mu)", fontFamily: "Space Mono,monospace", marginTop: 4 }}>
            {paste.length} chars{paste.length < 30 ? " — add more content" : " ✓"}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 14 }}>
          <div className={"up-z " + (drag ? "drag" : "")} onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)} onDrop={onDrop}>
            <input ref={fileRef} type="file" style={{ display: "none" }} accept=".pdf,.txt,.doc,.docx" onChange={e => onFile(e.target.files[0])} />
            <div style={{ fontSize: 38, marginBottom: 10 }}>📄</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Drop your resume here</div>
            <div style={{ fontSize: 11, color: "var(--mu)", fontFamily: "Space Mono,monospace" }}>PDF · TXT · DOC — click or drag</div>
          </div>
          {file && (
            <div style={{ background: "rgba(0,212,255,.06)", border: "1px solid rgba(0,212,255,.3)", borderRadius: 8, padding: "10px 13px", marginTop: 10, display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 18 }}>📋</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{file.name}</div>
                <div style={{ fontSize: 10, color: "var(--mu)", fontFamily: "Space Mono,monospace" }}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--mu)", cursor: "pointer", fontSize: 17 }} onClick={() => { setFile(null); setResults(null); setErr(""); }}>×</button>
            </div>
          )}
          <div style={{ marginTop: 8, padding: "7px 11px", background: "rgba(251,191,36,.07)", border: "1px solid rgba(251,191,36,.2)", borderRadius: 7, fontSize: 11, color: "var(--wa)", fontFamily: "Space Mono,monospace" }}>
            ⚠ For best results use Paste Text mode — works with all resume formats
          </div>
        </div>
      )}

      <div className="g2" style={{ marginBottom: 14 }}>
        <div><label className="lbl">🎯 Target Job Title</label><input className="inp" placeholder="e.g. Software Developer…" value={jobTitle} onChange={e => setJobTitle(e.target.value)} /></div>
        <div><label className="lbl">📄 Job Description (optional)</label><textarea className="txa" style={{ minHeight: 72 }} placeholder="Paste JD for better keyword match…" value={jobDesc} onChange={e => setJobDesc(e.target.value)} /></div>
      </div>

      <button className="pbtn" disabled={!canRun || loading} onClick={analyze}>
        {loading ? <><Spin />{loadMsg || "Scanning…"}</> : "🔍 Run ATS Analysis"}
      </button>
      {err && <div className="err">❌ {err}</div>}

      {results && (
        <>
          <hr className="div" />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 26 }}>
            <div style={{ width: 116, height: 116, borderRadius: "50%", background: "conic-gradient(" + sc + " 0% " + results.score + "%, var(--sf2) " + results.score + "% 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 11 }}>
              <div style={{ width: 90, height: 90, borderRadius: "50%", background: "var(--sf)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: sc, fontFamily: "Space Mono,monospace" }}>{results.score}</div>
                <div style={{ fontSize: 10, color: "var(--mu)", fontFamily: "Space Mono,monospace" }}>/100</div>
              </div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>ATS Score</div>
            <div style={{ fontSize: 12, color: "var(--mu)", fontFamily: "Space Mono,monospace", marginTop: 3 }}>{results.verdict}</div>
          </div>
          <div className="g2">
            <div className="card"><div style={{ fontSize: 11, fontWeight: 700, color: "var(--ac3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>✅ Strengths</div>{results.strengths?.map((s, i) => <div key={i} style={{ fontSize: 12, color: "var(--mu)", display: "flex", gap: 6, marginBottom: 5 }}><span style={{ color: "var(--ac3)" }}>◆</span>{s}</div>)}</div>
            <div className="card"><div style={{ fontSize: 11, fontWeight: 700, color: "var(--re)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>⚠ Weaknesses</div>{results.weaknesses?.map((s, i) => <div key={i} style={{ fontSize: 12, color: "var(--mu)", display: "flex", gap: 6, marginBottom: 5 }}><span style={{ color: "var(--re)" }}>◆</span>{s}</div>)}</div>
            <div className="card"><div style={{ fontSize: 11, fontWeight: 700, color: "var(--ac)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>🔑 Keywords</div><div className="chips">{results.keywordsFound?.map(k => <span key={k} className="bdg bg" style={{ marginBottom: 4 }}>{k}</span>)}{results.keywordsMissing?.map(k => <span key={k} className="bdg br" style={{ marginBottom: 4 }}>✗ {k}</span>)}</div></div>
            <div className="card"><div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>🚀 Improvements</div>{results.improvements?.map((s, i) => <div key={i} style={{ fontSize: 12, color: "var(--mu)", padding: "5px 8px", borderLeft: "2px solid var(--ac2)", marginBottom: 4 }}>{s}</div>)}</div>
          </div>
          {results.formattingIssues?.length > 0 && (
            <div className="card" style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wa)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>📐 Formatting</div>
              {results.formattingIssues.map((s, i) => <div key={i} style={{ fontSize: 12, color: "var(--mu)", display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: "var(--wa)" }}>▸</span>{s}</div>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   3. COMPANY GUIDE
════════════════════════════════════════════════════════════════════════ */
function CompanyGuide() {
  const [sel, setSel] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const load = async co => {
    setSel(co); setData(null); setLoading(true); setErr("");
    try {
      const raw = await callClaude(
        [{ role: "user", content: "Company: " + co.n }],
        "Tech placement expert. Return ONLY raw JSON ({ to }): {\"overview\":string,\"mustLearnSkills\":[{\"name\":string,\"why\":string,\"level\":\"MUST\"|\"GOOD\"|\"BONUS\"}],\"interviewRounds\":[{\"round\":string,\"description\":string}],\"topicsToStudy\":string[],\"insiderTips\":string[],\"salaryRanges\":[{\"role\":string,\"ctc\":string}],\"culture\":string[]} — mustLearnSkills 6-8, interviewRounds 4-6, topicsToStudy 8-10, insiderTips 4-5, salaryRanges 3-4, culture 4. ONLY JSON.",
        2000
      );
      setData(parseJSON(raw));
    } catch (e) { setErr(e.message || "Failed to load. Try again."); }
    setLoading(false);
  };

  const doSearch = () => { if (q.trim()) { load({ n: q.trim(), e: "🏢", t: "Company" }); setQ(""); } };

  return (
    <div>
      <div className="ttl">Company <span>Guide</span></div>
      <div className="sub">// Click a company → must-learn skills, rounds & insider tips</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input className="inp" placeholder="Search any company…" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()} />
        <button className="pbtn" style={{ width: "auto", padding: "8px 18px" }} disabled={!q.trim()} onClick={doSearch}>Search</button>
      </div>

      {!data && !loading && Object.entries(COS).map(([cat, cos]) => (
        <div key={cat} style={{ marginBottom: 22 }}>
          <div className="cl">{cat}</div>
          <div className="co-g">
            {cos.map(c => (
              <div key={c.n} className={"co-c " + (sel?.n === c.n ? "on" : "")} onClick={() => load(c)}>
                <div style={{ fontSize: 22 }}>{c.e}</div>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{c.n}</div>
                <div style={{ fontSize: 9, color: "var(--mu)", fontFamily: "Space Mono,monospace" }}>{c.t}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {loading && <div className="ld"><div className="ring" /><div style={{ fontSize: 12, color: "var(--mu)", fontFamily: "Space Mono,monospace" }}>Loading {sel?.n}…</div></div>}
      {err && <div className="err">{err}</div>}

      {data && !loading && (
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 13, background: "var(--sf)", border: "1px solid var(--bd)", borderRadius: 12, padding: "16px 18px", marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ fontSize: 32 }}>{sel?.e}</div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 3 }}>{sel?.n}</div>
              <div style={{ fontSize: 12, color: "var(--mu)", lineHeight: 1.5 }}>{data.overview}</div>
              {data.culture?.length > 0 && <div className="chips" style={{ marginTop: 7 }}>{data.culture.map((c, i) => <span key={i} className="bdg bb">{c}</span>)}</div>}
            </div>
            <button className="obtn" onClick={() => { setData(null); setSel(null); }}>← Back</button>
          </div>

          <div className="sg">
            <div className="bx fw">
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ac)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>⚡ Must-Learn Skills</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 8 }}>
                {data.mustLearnSkills?.map((s, i) => (
                  <div key={i} className="mi">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "var(--mu)" }}>{s.why}</div>
                    </div>
                    <span className={"bdg " + s.level}>{s.level}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bx">
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wa)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>🎯 Interview Rounds</div>
              {data.interviewRounds?.map((r, i) => (
                <div key={i} className="ri">
                  <div className="rn">{i + 1}</div>
                  <div><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{r.round}</div><div style={{ fontSize: 11, color: "var(--mu)" }}>{r.description}</div></div>
                </div>
              ))}
            </div>
            <div className="bx">
              <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>📚 Topics</div>
              <div className="chips">{data.topicsToStudy?.map((t, i) => <span key={i} className="pill pp">{t}</span>)}</div>
            </div>
            <div className="bx">
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ac3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>💡 Insider Tips</div>
              {data.insiderTips?.map((t, i) => <div key={i} style={{ fontSize: 12, color: "var(--mu)", padding: "5px 8px", borderLeft: "2px solid #a78bfa", marginBottom: 4 }}>{t}</div>)}
            </div>
            <div className="bx">
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ac3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>💰 Salary Ranges</div>
              {data.salaryRanges?.map((s, i) => (
                <div key={i} className="sr">
                  <span style={{ fontSize: 12, color: "var(--mu)" }}>{s.role}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ac3)", fontFamily: "Space Mono,monospace" }}>{s.ctc}</span>
                </div>
              ))}
              <div style={{ fontSize: 10, color: "var(--mu)", marginTop: 6, fontFamily: "Space Mono,monospace" }}>// Approximate · varies by experience</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   4. ROADMAP PLANNER
════════════════════════════════════════════════════════════════════════ */
function RoadmapPlanner() {
  const [co, setCo] = useState("");
  const [custom, setCustom] = useState("");
  const [months, setMonths] = useState(2);
  const [mySkills, setMySkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [rm, setRm] = useState(null);
  const [err, setErr] = useState("");

  const target = co === "__other__" ? custom : co;

  const gen = async () => {
    setLoading(true); setErr(""); setRm(null);
    try {
      const wks = months * 4;
      const sys = "Placement coach. Return ONLY raw JSON ({ to }). Keep ALL string values under 15 words. {\"summary\":string,\"totalWeeks\":number,\"totalHours\":number,\"dailyHours\":number,\"phases\":[{\"name\":string,\"icon\":string,\"color\":string(one of #00d4ff #7c3aed #10b981 #fbbf24),\"weekRange\":string,\"weeks\":[{\"week\":number,\"title\":string,\"tasks\":string[](4),\"weeklyGoal\":string}]}],\"interviewRounds\":[{\"round\":string,\"description\":string,\"howToPrepare\":string,\"keyTopics\":string[](3)}],\"dailySchedule\":[{\"day\":string,\"focus\":string,\"hours\":string}],\"finalWeekPlan\":string[](5),\"doNotForget\":string[](4)} — phases cover ALL " + wks + " weeks, dailySchedule=7 items Mon-Sun. Output raw JSON only.";
      const raw = await callClaude(
        [{ role: "user", content: "Company:" + target + " Months:" + months + "(" + wks + "wks) Skills:" + (mySkills || "beginner") }],
        sys, 4000
      );
      setRm(parseJSON(raw));
    } catch (e) { setErr(e.message || "Failed. Try again."); }
    setLoading(false);
  };

  if (rm) {
    const logo = CO_E[target] || "🏢";
    return (
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 13, background: "linear-gradient(135deg,rgba(0,212,255,.08),rgba(124,58,237,.08))", border: "1px solid var(--bd)", borderRadius: 13, padding: "16px 20px", marginBottom: 22, flexWrap: "wrap" }}>
          <div style={{ fontSize: 30 }}>{logo}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 3 }}>🗺️ Crack <span style={{ color: "var(--ac)" }}>{target}</span> in {months} Month{months > 1 ? "s" : ""}</div>
            <div style={{ fontSize: 11, color: "var(--mu)", fontFamily: "Space Mono,monospace" }}>{rm.totalWeeks}wk · ~{rm.dailyHours}h/day · ~{rm.totalHours}h total</div>
            <div style={{ fontSize: 12, color: "var(--mu)", marginTop: 3, lineHeight: 1.5 }}>{rm.summary}</div>
          </div>
          <button className="obtn" onClick={() => setRm(null)}>← New Plan</button>
        </div>

        <div className="stg">
          {[{ n: months + "mo", l: "Available" }, { n: rm.totalWeeks, l: "Weeks" }, { n: rm.dailyHours + "h", l: "Daily" }, { n: rm.totalHours, l: "Hours" }, { n: rm.interviewRounds?.length, l: "Rounds" }, { n: rm.phases?.length, l: "Phases" }].map((s, i) => (
            <div key={i} className="sc"><div className="sn">{s.n}</div><div className="sl">{s.l}</div></div>
          ))}
        </div>

        {rm.phases?.map((ph, pi) => {
          const col = ph.color || PH_COLS[pi % PH_COLS.length];
          return (
            <div key={pi} style={{ marginBottom: 26 }}>
              <div className="rm-ph" style={{ background: col + "10", borderColor: col + "30" }}>
                <span style={{ fontSize: 17 }}>{ph.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: col }}>{ph.name}</span>
                <span style={{ fontSize: 10, color: "var(--mu)", fontFamily: "Space Mono,monospace", marginLeft: "auto" }}>{ph.weekRange}</span>
              </div>
              <div className="wg">
                {ph.weeks?.map((w, wi) => (
                  <div key={wi} className="wc" style={{ "--wcc": col, animationDelay: (wi * 0.07) + "s" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "var(--mu)", letterSpacing: 1, textTransform: "uppercase", fontFamily: "Space Mono,monospace", marginBottom: 4 }}>Week {w.week}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 7 }}>{w.title}</div>
                    <ul>{w.tasks?.map((t, ti) => <li key={ti}><span className="dt" style={{ background: col }} />{t}</li>)}</ul>
                    {w.weeklyGoal && <div style={{ marginTop: 7, padding: "5px 9px", borderRadius: 6, background: "rgba(0,212,255,.06)", border: "1px solid rgba(0,212,255,.15)", fontSize: 10, color: "var(--ac)", fontFamily: "Space Mono,monospace" }}>🎯 {w.weeklyGoal}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <hr className="div" />
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>🎯 How to Clear Every <span style={{ color: "var(--ac)" }}>Round</span></div>
        {rm.interviewRounds?.map((r, i) => (
          <div key={i} className="rr" style={{ animationDelay: (i * 0.07) + "s" }}>
            <div className="rrn">{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3 }}>{r.round}</div>
              <div style={{ fontSize: 12, color: "var(--mu)", marginBottom: 4 }}>{r.description}</div>
              <div style={{ fontSize: 11, color: "var(--ac3)", marginBottom: 5, fontStyle: "italic" }}>{r.howToPrepare}</div>
              <div className="chips">{r.keyTopics?.map((t, ti) => <span key={ti} className="pill pp">{t}</span>)}</div>
            </div>
          </div>
        ))}

        <hr className="div" />
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>📅 Daily <span style={{ color: "var(--wa)" }}>Schedule</span></div>
        <div className="dg">
          {rm.dailySchedule?.map((d, i) => (
            <div key={i} className="dc" style={{ animationDelay: (i * 0.05) + "s" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--mu)", fontFamily: "Space Mono,monospace", textTransform: "uppercase", marginBottom: 4 }}>{d.day}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{d.focus}</div>
              <div style={{ fontSize: 10, color: "var(--ac)", fontFamily: "Space Mono,monospace" }}>⏱ {d.hours}</div>
            </div>
          ))}
        </div>

        <hr className="div" />
        <div className="g2">
          <div className="bx">
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ac3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 11 }}>🏁 Final Week</div>
            {rm.finalWeekPlan?.map((t, i) => <div key={i} style={{ fontSize: 12, color: "var(--mu)", display: "flex", gap: 6, padding: "4px 0", borderBottom: "1px solid var(--bd)" }}><span style={{ color: "var(--ac3)" }}>✓</span>{t}</div>)}
          </div>
          <div className="bx">
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--re)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 11 }}>⚠️ Avoid These</div>
            {rm.doNotForget?.map((t, i) => <div key={i} style={{ fontSize: 12, color: "var(--mu)", display: "flex", gap: 6, padding: "4px 0", borderBottom: "1px solid var(--bd)" }}><span style={{ color: "var(--re)" }}>✗</span>{t}</div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="ttl">Placement <span>Roadmap</span></div>
      <div className="sub">// Pick company + months → complete week-by-week battle plan</div>
      <div className="bx" style={{ marginBottom: 18 }}>
        <div className="g2" style={{ marginBottom: 14 }}>
          <div>
            <label className="lbl">🎯 Target Company</label>
            <select className="sel" value={co} onChange={e => setCo(e.target.value)}>
              <option value="">— Select company —</option>
              {ALL_COS.map(c => <option key={c} value={c}>{CO_E[c] || "🏢"} {c}</option>)}
              <option value="__other__">✏️ Other…</option>
            </select>
            {co === "__other__" && <input className="inp" style={{ marginTop: 7 }} placeholder="Type company…" value={custom} onChange={e => setCustom(e.target.value)} />}
          </div>
          <div>
            <label className="lbl">💡 Your Current Skills</label>
            <input className="inp" placeholder="e.g. Python basics, some DSA…" value={mySkills} onChange={e => setMySkills(e.target.value)} />
          </div>
        </div>
        <label className="lbl">⏳ Months Available</label>
        <div className="chips" style={{ marginBottom: 16 }}>
          {[1, 2, 3, 4, 5, 6].map(m => (
            <button key={m} className={"chip " + (months === m ? "on" : "")} style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => setMonths(m)}>{m} {m === 1 ? "Mo" : "Months"}</button>
          ))}
        </div>
        <button className="pbtn" disabled={!target || loading} onClick={gen}>
          {loading ? <><Spin />Generating…</> : "🗺️ Generate " + (target || "Company") + " Roadmap — " + months + " Month" + (months > 1 ? "s" : "")}
        </button>
      </div>
      {err && <div className="err">{err}</div>}
      {loading && <div className="ld"><div className="ring" /><div style={{ fontSize: 12, color: "var(--mu)", fontFamily: "Space Mono,monospace" }}>Building your {months}-month plan for {target}…</div></div>}
      <div className="cl" style={{ marginBottom: 9 }}>Quick pick</div>
      <div className="chips">
        {["Zoho","TCS","Accenture","Infosys","Google","Amazon","Microsoft","Freshworks","Razorpay","Wipro"].map(c => (
          <button key={c} className={"chip " + (co === c ? "on" : "")} onClick={() => setCo(c)}>{CO_E[c] || "🏢"} {c}</button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   5. MOCK INTERVIEW
════════════════════════════════════════════════════════════════════════ */
function MockInterview() {
  const [co, setCo] = useState("Zoho");
  const [round, setRound] = useState(MI_ROUNDS[0]);
  const [role, setRole] = useState("Software Developer");
  const [phase, setPhase] = useState("setup");
  const [qs, setQs] = useState([]);
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState("");
  const [fbs, setFbs] = useState([]);
  const [fbL, setFbL] = useState(false);
  const [curFb, setCurFb] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const TOTAL = 6;

  const start = async () => {
    setLoading(true); setErr("");
    try {
      const raw = await callClaude(
        [{ role: "user", content: "Company:" + co + " Role:" + role + " Round:" + round }],
        "Interviewer at " + co + ". Generate exactly " + TOTAL + " interview questions for " + role + " in \"" + round + "\". Return ONLY raw JSON array: [{\"question\":string,\"type\":string(Coding|Technical|Behavioural|Aptitude|HR),\"hint\":string,\"difficulty\":string(Easy|Medium|Hard)}]",
        2000
      );
      setQs(parseJSON(raw)); setCur(0); setFbs([]); setCurFb(null); setAns(""); setPhase("interview");
    } catch (e) { setErr(e.message || "Failed to start."); }
    setLoading(false);
  };

  const submit = async () => {
    setFbL(true); setCurFb(null);
    try {
      const q = qs[cur];
      const raw = await callClaude(
        [{ role: "user", content: "Q: " + q.question + "\nAnswer: " + ans }],
        "Interviewer at " + co + ". Evaluate answer. Return ONLY raw JSON: {\"score\":number 1-10,\"verdict\":string(Excellent|Good|Average|Poor),\"feedback\":string,\"idealAnswer\":string}",
        800
      );
      const fb = parseJSON(raw);
      const entry = { question: qs[cur].question, type: qs[cur].type, ans, ...fb };
      setCurFb(entry); setFbs(p => [...p, entry]);
    } catch { setCurFb({ score: 5, verdict: "Average", feedback: "Could not evaluate.", idealAnswer: "N/A" }); }
    setFbL(false);
  };

  const next = () => {
    if (cur + 1 >= TOTAL) setPhase("report");
    else { setCur(c => c + 1); setAns(""); setCurFb(null); }
  };

  const sc = s => s >= 8 ? "var(--ac3)" : s >= 5 ? "var(--wa)" : "var(--re)";
  const avg = fbs.length ? Math.round(fbs.reduce((a, f) => a + f.score, 0) / fbs.length * 10) : 0;

  if (phase === "report") return (
    <div>
      <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,.1),rgba(0,212,255,.08))", border: "1px solid var(--bd)", borderRadius: 13, padding: 26, textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 50, fontWeight: 800, fontFamily: "Space Mono,monospace", color: sc(avg / 10) }}>{avg}<span style={{ fontSize: 20, color: "var(--mu)" }}>/100</span></div>
        <div style={{ fontSize: 11, color: "var(--mu)", fontFamily: "Space Mono,monospace" }}>Overall · {co} · {round}</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 9 }}>{avg >= 80 ? "🏆 Excellent!" : avg >= 60 ? "👍 Good — a bit more prep" : avg >= 40 ? "😐 Average — keep going" : "📚 Needs practice"}</div>
      </div>
      <div className="stg">
        {[{ n: fbs.length + "/" + TOTAL, l: "Answered" }, { n: Math.max(...fbs.map(f => f.score)), l: "Best" }, { n: Math.min(...fbs.map(f => f.score)), l: "Lowest" }, { n: fbs.filter(f => f.score >= 7).length, l: "Strong" }].map((s, i) => (
          <div key={i} className="sc"><div className="sn">{s.n}</div><div className="sl">{s.l}</div></div>
        ))}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 11 }}>📋 Review</div>
      {fbs.map((f, i) => (
        <div key={i} className="mir">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Q{i + 1}. {f.question}</div>
          <span style={{ fontSize: 10, fontFamily: "Space Mono,monospace", padding: "2px 8px", borderRadius: 14, background: sc(f.score) + "18", color: sc(f.score), border: "1px solid " + sc(f.score) + "40", display: "inline-block", marginBottom: 6 }}>{f.score}/10 · {f.verdict}</span>
          <div style={{ fontSize: 12, color: "var(--mu)", lineHeight: 1.5, marginBottom: f.idealAnswer !== "N/A" ? 6 : 0 }}>{f.feedback}</div>
          {f.idealAnswer !== "N/A" && <div style={{ padding: "7px 9px", borderRadius: 7, background: "var(--sf2)", fontSize: 11, color: "var(--mu)", borderLeft: "2px solid #a78bfa" }}>💡 {f.idealAnswer}</div>}
        </div>
      ))}
      <button className="obtn" style={{ marginTop: 12 }} onClick={() => setPhase("setup")}>← Try Another</button>
    </div>
  );

  if (phase === "interview") {
    const q = qs[cur];
    if (!q) return null;
    const tc = { Coding: "#00d4ff", Technical: "#7c3aed", Behavioural: "#10b981", Aptitude: "#fbbf24", HR: "#f87171" }[q.type] || "#00d4ff";
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--mu)", fontFamily: "Space Mono,monospace", marginBottom: 7 }}>
          <span>{co} · {round}</span><span>Q{cur + 1}/{TOTAL}</span>
        </div>
        <div className="prog"><div className="pf" style={{ width: (cur / TOTAL * 100) + "%", background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} /></div>
        {!curFb ? (
          <div className="miq">
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 14, background: tc + "18", color: tc, border: "1px solid " + tc + "30", display: "inline-block", marginBottom: 9, fontFamily: "Space Mono,monospace" }}>{q.type} · {q.difficulty}</span>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.5, marginBottom: 11 }}>{q.question}</div>
            {q.hint && <div style={{ fontSize: 12, color: "var(--mu)", marginBottom: 11, fontStyle: "italic" }}>💡 {q.hint}</div>}
            <textarea className="txa" style={{ minHeight: 100 }} placeholder="Type your answer…" value={ans} onChange={e => setAns(e.target.value)} />
            <button className="pbtn pu" style={{ marginTop: 11 }} disabled={!ans.trim() || fbL} onClick={submit}>
              {fbL ? "Evaluating…" : "Submit Answer →"}
            </button>
          </div>
        ) : (
          <div className="mifb">
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "Space Mono,monospace", color: sc(curFb.score), marginBottom: 2 }}>{curFb.score}<span style={{ fontSize: 13, color: "var(--mu)" }}>/10</span></div>
            <div style={{ fontSize: 11, color: "var(--mu)", fontFamily: "Space Mono,monospace", marginBottom: 11 }}>{curFb.verdict}</div>
            <div style={{ fontSize: 12, color: "var(--mu)", lineHeight: 1.6, marginBottom: 11 }}>{curFb.feedback}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>💡 Ideal Answer</div>
            <div style={{ background: "var(--sf2)", borderRadius: 8, padding: "9px 12px", fontSize: 12, lineHeight: 1.6, borderLeft: "3px solid #7c3aed" }}>{curFb.idealAnswer}</div>
            <button className="pbtn" style={{ marginTop: 12, background: "linear-gradient(135deg,var(--ac),#0099bb)", color: "#000" }} onClick={next}>
              {cur + 1 >= TOTAL ? "See Report 📊" : "Next →"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="ttl">Mock <span>Interview</span></div>
      <div className="sub">// Simulate a real interview → AI scores every answer</div>
      <div className="bx" style={{ marginBottom: 18 }}>
        <div className="g3" style={{ marginBottom: 16 }}>
          <div><label className="lbl">🏢 Company</label><select className="sel" value={co} onChange={e => setCo(e.target.value)}>{ALL_COS.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="lbl">🎯 Round</label><select className="sel" value={round} onChange={e => setRound(e.target.value)}>{MI_ROUNDS.map(r => <option key={r}>{r}</option>)}</select></div>
          <div><label className="lbl">💼 Role</label><input className="inp" value={role} onChange={e => setRole(e.target.value)} /></div>
        </div>
        <button className="pbtn pu" disabled={loading} onClick={start}>
          {loading ? <><Spin c="#fff" />Preparing…</> : "🎤 Start " + co + " Mock Interview"}
        </button>
      </div>
      {err && <div className="err">{err}</div>}
      <div className="g2">
        {[["🎤","6 Real Questions","Company-specific questions for your round"],["🤖","AI Scoring","Each answer scored 1–10 with feedback"],["💡","Ideal Answers","See the best answer for every question"],["📊","Full Report","Overall score + review after all questions"]].map((c, i) => (
          <div key={i} className="card"><div style={{ fontSize: 20, marginBottom: 6 }}>{c[0]}</div><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{c[1]}</div><div style={{ fontSize: 11, color: "var(--mu)", lineHeight: 1.5 }}>{c[2]}</div></div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   6. APTITUDE QUIZ
════════════════════════════════════════════════════════════════════════ */
function AptitudeQuiz() {
  const [co, setCo] = useState("TCS");
  const [cats, setCats] = useState(["Quantitative Aptitude", "Logical Reasoning"]);
  const [numQ, setNumQ] = useState(10);
  const [phase, setPhase] = useState("setup");
  const [qs, setQs] = useState([]);
  const [cur, setCur] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const timerRef = useRef(null);
  const revRef = useRef(false);

  const toggle = c => setCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  useEffect(() => {
    if (phase !== "quiz") { clearInterval(timerRef.current); return; }
    revRef.current = false;
    setTimer(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (!revRef.current) {
            revRef.current = true;
            setRevealed(true);
            setAnswers(p => [...p, { chosen: -1, correct: qs[cur]?.correct, timedOut: true }]);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, cur]); // eslint-disable-line

  const startQuiz = async () => {
    setLoading(true); setErr("");
    try {
      const raw = await callClaude(
        [{ role: "user", content: "Company:" + co + " Categories:" + cats.join(",") + " Count:" + numQ }],
        "Generate exactly " + numQ + " aptitude MCQ for " + co + " placement. Categories: " + cats.join(", ") + ". Return ONLY raw JSON array: [{\"question\":string,\"options\":string[](4),\"correct\":number 0-3,\"explanation\":string,\"category\":string,\"difficulty\":\"Easy\"|\"Medium\"|\"Hard\"}]. Raw JSON only.",
        3000
      );
      const q = parseJSON(raw);
      setQs(q); setCur(0); setAnswers([]); setChosen(null); setRevealed(false); setTimer(30); setPhase("quiz");
    } catch (e) { setErr(e.message || "Failed to load questions."); }
    setLoading(false);
  };

  const choose = idx => {
    if (revealed) return;
    clearInterval(timerRef.current);
    revRef.current = true;
    setChosen(idx); setRevealed(true);
    setAnswers(p => [...p, { chosen: idx, correct: qs[cur]?.correct, timedOut: false }]);
  };

  const goNext = () => {
    if (cur + 1 >= qs.length) { setPhase("result"); return; }
    setCur(c => c + 1); setChosen(null); setRevealed(false);
  };

  if (phase === "result") {
    const correct = answers.filter(a => a.chosen === a.correct).length;
    const pct = Math.round(correct / qs.length * 100);
    const col = pct >= 70 ? "var(--ac3)" : pct >= 50 ? "var(--wa)" : "var(--re)";
    return (
      <div>
        <div className="aqr">
          <div className="abig" style={{ color: col }}>{pct}<span style={{ fontSize: 22, color: "var(--mu)" }}>%</span></div>
          <div style={{ fontSize: 11, color: "var(--mu)", fontFamily: "Space Mono,monospace" }}>{correct}/{qs.length} Correct · {co}</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 9 }}>{pct >= 80 ? "🏆 Excellent!" : pct >= 60 ? "👍 Good effort" : pct >= 40 ? "😐 Keep practicing" : "📚 Need more prep"}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 14, flexWrap: "wrap" }}>
            {[{ n: correct, l: "Correct", c: "var(--ac3)" }, { n: qs.length - correct, l: "Wrong", c: "var(--re)" }, { n: answers.filter(a => a.timedOut).length, l: "Timed Out", c: "var(--wa)" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 800, fontFamily: "Space Mono,monospace", color: s.c }}>{s.n}</div><div style={{ fontSize: 11, color: "var(--mu)" }}>{s.l}</div></div>
            ))}
          </div>
          <button className="pbtn pg" style={{ marginTop: 16 }} onClick={() => setPhase("setup")}>← Try Again</button>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, margin: "18px 0 11px" }}>📋 Review</div>
        <div className="arv">
          {qs.map((q, i) => {
            const a = answers[i] || {};
            const ok = a.chosen === q.correct;
            return (
              <div key={i} className="arc" style={{ animationDelay: (i * 0.04) + "s" }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 5, lineHeight: 1.4 }}>Q{i + 1}. {q.question}</div>
                <div style={{ fontSize: 10, fontFamily: "Space Mono,monospace", color: ok ? "var(--ac3)" : "var(--re)", marginBottom: 3 }}>{a.timedOut ? "⏰ Timed Out" : ok ? "✓ Correct" : "✗ " + (q.options[a.chosen] || "?")}</div>
                <div style={{ fontSize: 10, fontFamily: "Space Mono,monospace", color: "var(--ac3)", marginBottom: 4 }}>✓ {q.options[q.correct]}</div>
                <div style={{ fontSize: 11, color: "var(--mu)", lineHeight: 1.4 }}>{q.explanation}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    const q = qs[cur];
    if (!q) return null;
    const pct = cur / qs.length * 100;
    const correct = answers.filter(a => a.chosen === a.correct).length;
    const dCls = { Easy: "bg", Medium: "bw", Hard: "br" }[q.difficulty] || "bw";
    return (
      <div>
        <div className="prog"><div className="pf" style={{ width: pct + "%", background: "linear-gradient(90deg,var(--ac3),#059669)" }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13, flexWrap: "wrap", gap: 7 }}>
          <div style={{ fontSize: 11, fontFamily: "Space Mono,monospace", color: "var(--mu)" }}>Q <strong style={{ color: "var(--tx)" }}>{cur + 1}</strong>/{qs.length} · Score <strong style={{ color: "var(--ac3)" }}>{correct}</strong></div>
          <div className={"atm " + (timer <= 10 ? "red" : "")}>{timer}s</div>
        </div>
        <div className="aqq">
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 11, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: "var(--mu)", fontFamily: "Space Mono,monospace" }}>Q{cur + 1}</span>
            <span className={"bdg bb"} style={{ fontSize: 10 }}>{q.category}</span>
            <span className={"bdg " + dCls} style={{ fontSize: 10 }}>{q.difficulty}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.55, marginBottom: 16 }}>{q.question}</div>
          {q.options?.map((opt, oi) => {
            let cls = "aop";
            if (revealed) { if (oi === q.correct) cls += " ok"; else if (oi === chosen) cls += " no"; }
            else if (oi === chosen) cls += " ch";
            return (
              <button key={oi} className={cls} disabled={revealed} onClick={() => choose(oi)}>
                <span style={{ opacity: 0.45, marginRight: 7, fontFamily: "Space Mono,monospace", fontSize: 10 }}>{["A","B","C","D"][oi]}.</span>{opt}
              </button>
            );
          })}
          {revealed && <div style={{ marginTop: 11, padding: "9px 12px", borderRadius: 8, background: "var(--sf2)", borderLeft: "3px solid var(--ac3)", fontSize: 12, color: "var(--mu)", lineHeight: 1.6 }}>💡 {q.explanation}</div>}
          {revealed && <button className="pbtn pg" style={{ marginTop: 11 }} onClick={goNext}>{cur + 1 >= qs.length ? "See Results 📊" : "Next →"}</button>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="ttl">Aptitude <span>Quiz</span></div>
      <div className="sub">// Company MCQs with 30s timer → instant answers + score</div>
      <div className="bx" style={{ marginBottom: 18 }}>
        <div className="g2" style={{ marginBottom: 14 }}>
          <div><label className="lbl">🏢 Company Style</label><select className="sel" value={co} onChange={e => setCo(e.target.value)}>{["Zoho","TCS","Infosys","Wipro","Accenture","Capgemini","Cognizant","HCL","IBM","Freshworks"].map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="lbl">❓ Questions</label><select className="sel" value={numQ} onChange={e => setNumQ(Number(e.target.value))}>{[5,10,15,20].map(n => <option key={n} value={n}>{n} Questions</option>)}</select></div>
        </div>
        <label className="lbl">📚 Categories</label>
        <div className="chips" style={{ marginBottom: 16 }}>
          {AQ_CATS.map(c => <button key={c} className={"chip " + (cats.includes(c) ? "on" : "")} onClick={() => toggle(c)}>{c}</button>)}
        </div>
        <button className="pbtn pg" disabled={!cats.length || loading} onClick={startQuiz}>
          {loading ? <><Spin c="#fff" />Generating…</> : "🧠 Start " + co + " Quiz · " + numQ + " Questions"}
        </button>
      </div>
      {err && <div className="err">{err}</div>}
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════════════
   7. RESUME BUILDER
════════════════════════════════════════════════════════════════════════ */
function ResumeBuilder() {
  const STEPS = ["Personal", "Education", "Experience", "Projects", "Skills", "Preview"];
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [generated, setGenerated] = useState(null);
  const previewRef = useRef();

  // Form state
  const [personal, setPersonal] = useState({ name:"", email:"", phone:"", location:"", linkedin:"", github:"", objective:"" });
  const [education, setEducation] = useState([{ degree:"", institution:"", year:"", cgpa:"", board:"" }]);
  const [experience, setExperience] = useState([{ title:"", company:"", duration:"", description:"" }]);
  const [projects, setProjects] = useState([
    {
      name: "PlacementAI — Student Placement Prediction App",
      tech: "React.js, JavaScript, Claude AI API, REST API Integration, CSS3",
      description: "Built a full-stack AI-powered placement preparation platform with Skill Matcher, ATS Resume Scanner, Company Guide, Roadmap Planner, Mock Interview Simulator, and Aptitude Quiz. Integrated Claude Sonnet API with exponential backoff retry logic to handle rate limits. Developed week-by-week Roadmap Planner generating company-specific study plans. Implemented timed Aptitude Quiz engine with 30s countdown across 6 categories and 10+ companies. Built ATS Resume Scanner that scores compatibility 0-100 and identifies missing keywords."
    },
    {
      name: "Predictive Analysis of Bank Marketing Campaigns",
      tech: "Python, Pandas, Scikit-learn, Logistic Regression, Decision Trees, Random Forest",
      description: "Analyzed real-world bank marketing data to predict customer subscription to term deposits using machine learning. Performed data preprocessing including one-hot encoding, feature scaling, and train-test splitting. Built and evaluated a Random Forest model using accuracy, confusion matrix, and classification report, and identified key features using feature importance analysis."
    }
  ]);
  const [skills, setSkills] = useState({ technical:[], soft:[], languages:[], tools:[], inp:"" });

  const updP = (k, v) => setPersonal(p => ({ ...p, [k]: v }));
  const addEdu = () => setEducation(p => [...p, { degree:"", institution:"", year:"", cgpa:"", board:"" }]);
  const updEdu = (i, k, v) => setEducation(p => p.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const delEdu = i => setEducation(p => p.filter((_, idx) => idx !== i));
  const addExp = () => setExperience(p => [...p, { title:"", company:"", duration:"", description:"" }]);
  const updExp = (i, k, v) => setExperience(p => p.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const delExp = i => setExperience(p => p.filter((_, idx) => idx !== i));
  const addProj = () => setProjects(p => [...p, { name:"", tech:"", description:"" }]);
  const updProj = (i, k, v) => setProjects(p => p.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const delProj = i => setProjects(p => p.filter((_, idx) => idx !== i));

  const addSkill = (cat, v) => {
    const t = v.trim();
    if (!t) return;
    setSkills(p => ({ ...p, [cat]: p[cat].includes(t) ? p[cat] : [...p[cat], t], inp: "" }));
  };
  const delSkill = (cat, v) => setSkills(p => ({ ...p, [cat]: p[cat].filter(x => x !== v) }));

  const generate = async () => {
    setLoading(true); setErr(""); setGenerated(null);
    try {
      const payload = {
        personal,
        education: education.filter(e => e.institution || e.degree),
        experience: experience.filter(e => e.company || e.title),
        projects: projects.filter(p => p.name || p.description),
        skills: { technical: skills.technical, soft: skills.soft, languages: skills.languages, tools: skills.tools }
      };
      const sys = `You are a professional resume writer. Given structured resume data, generate polished, ATS-optimised resume content. Return ONLY raw JSON ({ to }):
{
  "summary": string (3-4 sentence professional summary using first person),
  "experience": [{ "title":string, "company":string, "duration":string, "bullets":string[](3-4 strong action-verb bullet points) }],
  "projects": [{ "name":string, "tech":string, "bullets":string[](2-3 bullet points describing impact) }],
  "skills": { "technical":string[], "soft":string[], "languages":string[], "tools":string[] }
}
Make bullet points start with strong action verbs. Be concise, professional, and ATS-friendly. Fill in reasonable content if some fields are sparse. ONLY raw JSON.`;
      const raw = await callClaude([{ role:"user", content: JSON.stringify(payload) }], sys, 2000);
      const ai = parseJSON(raw);
      setGenerated({ personal, education: payload.education, experience: ai.experience, projects: ai.projects, skills: ai.skills, summary: ai.summary });
      setStep(5);
    } catch(e) { setErr(e.message || "Generation failed. Try again."); }
    setLoading(false);
  };

  const downloadTxt = () => {
    if (!generated) return;
    const g = generated;
    const p = g.personal;
    let txt = p.name.toUpperCase() + "\n";
    const contact = [p.email, p.phone, p.location, p.linkedin, p.github].filter(Boolean).join(" | ");
    txt += contact + "\n\n";
    txt += "PROFESSIONAL SUMMARY\n" + "─".repeat(40) + "\n" + g.summary + "\n\n";
    if (g.experience?.length) {
      txt += "WORK EXPERIENCE\n" + "─".repeat(40) + "\n";
      g.experience.forEach(e => {
        txt += e.title + " | " + e.company + " | " + e.duration + "\n";
        e.bullets?.forEach(b => txt += "  • " + b + "\n");
        txt += "\n";
      });
    }
    if (g.education?.length) {
      txt += "EDUCATION\n" + "─".repeat(40) + "\n";
      g.education.forEach(e => {
        txt += e.degree + " | " + e.institution + " | " + e.year + (e.cgpa ? " | CGPA: " + e.cgpa : "") + "\n";
      });
      txt += "\n";
    }
    if (g.projects?.length) {
      txt += "PROJECTS\n" + "─".repeat(40) + "\n";
      g.projects.forEach(pr => {
        txt += pr.name + (pr.tech ? " | " + pr.tech : "") + "\n";
        pr.bullets?.forEach(b => txt += "  • " + b + "\n");
        txt += "\n";
      });
    }
    const allSkills = [...(g.skills.technical||[]), ...(g.skills.tools||[]), ...(g.skills.languages||[])];
    if (allSkills.length) txt += "TECHNICAL SKILLS\n" + "─".repeat(40) + "\n" + allSkills.join(" | ") + "\n\n";
    if (g.skills.soft?.length) txt += "SOFT SKILLS\n" + "─".repeat(40) + "\n" + g.skills.soft.join(" | ") + "\n";

    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = (p.name || "resume").replace(/\s+/g, "_") + "_resume.txt";
    a.click(); URL.revokeObjectURL(url);
  };

  // ── STEP INDICATOR ──
  const StepBar = () => (
    <div className="rb-steps">
      {STEPS.map((s, i) => (
        <div key={i} className="rb-step">
          <div className={"rb-step-dot " + (i < step ? "done" : i === step ? "active" : "")}
            style={{ cursor: i < step ? "pointer" : "default" }} onClick={() => i < step && setStep(i)}>
            {i < step ? "✓" : i + 1}
          </div>
          <div className={"rb-step-label " + (i < step ? "done" : i === step ? "active" : "")}>{s}</div>
          {i < STEPS.length - 1 && <div className={"rb-step-line " + (i < step ? "done" : "")} />}
        </div>
      ))}
    </div>
  );

  // ── STEP 0: PERSONAL ──
  if (step === 0) return (
    <div>
      <div className="ttl">Resume <span>Builder</span></div>
      <div className="sub">// Fill your details → AI generates a professional ATS-ready resume</div>
      <StepBar />
      <div className="rb-section">
        <div className="rb-section-ttl">👤 Personal Information</div>
        <div className="g2" style={{ gap:10 }}>
          <div><label className="lbl">Full Name *</label><input className="inp" placeholder="e.g. Rahul Sharma" value={personal.name} onChange={e=>updP("name",e.target.value)} /></div>
          <div><label className="lbl">Email *</label><input className="inp" placeholder="rahul@gmail.com" value={personal.email} onChange={e=>updP("email",e.target.value)} /></div>
          <div><label className="lbl">Phone</label><input className="inp" placeholder="+91 98765 43210" value={personal.phone} onChange={e=>updP("phone",e.target.value)} /></div>
          <div><label className="lbl">Location</label><input className="inp" placeholder="Chennai, Tamil Nadu" value={personal.location} onChange={e=>updP("location",e.target.value)} /></div>
          <div><label className="lbl">LinkedIn URL</label><input className="inp" placeholder="linkedin.com/in/rahul" value={personal.linkedin} onChange={e=>updP("linkedin",e.target.value)} /></div>
          <div><label className="lbl">GitHub URL</label><input className="inp" placeholder="github.com/rahul" value={personal.github} onChange={e=>updP("github",e.target.value)} /></div>
        </div>
        <div style={{ marginTop:10 }}><label className="lbl">Career Objective / Notes (optional)</label><textarea className="txa" style={{minHeight:70}} placeholder="Brief career goal or any notes for AI to personalise your summary…" value={personal.objective} onChange={e=>updP("objective",e.target.value)} /></div>
      </div>
      <div className="rb-nav">
        <div />
        <button className="pbtn" style={{ width:"auto", padding:"10px 28px" }} disabled={!personal.name||!personal.email} onClick={()=>setStep(1)}>Next: Education →</button>
      </div>
    </div>
  );

  // ── STEP 1: EDUCATION ──
  if (step === 1) return (
    <div>
      <div className="ttl">Resume <span>Builder</span></div>
      <div className="sub">// Step 2 of 6 — Education</div>
      <StepBar />
      {education.map((e, i) => (
        <div key={i} className="rb-item">
          {education.length > 1 && <button className="rb-item-del" onClick={()=>delEdu(i)}>×</button>}
          <div className="g2" style={{ gap:9 }}>
            <div><label className="lbl">Degree / Course *</label><input className="inp" placeholder="B.E. Computer Science" value={e.degree} onChange={ev=>updEdu(i,"degree",ev.target.value)} /></div>
            <div><label className="lbl">Institution *</label><input className="inp" placeholder="Anna University" value={e.institution} onChange={ev=>updEdu(i,"institution",ev.target.value)} /></div>
            <div><label className="lbl">Year of Passing</label><input className="inp" placeholder="2025" value={e.year} onChange={ev=>updEdu(i,"year",ev.target.value)} /></div>
            <div><label className="lbl">CGPA / Percentage</label><input className="inp" placeholder="8.5 / 85%" value={e.cgpa} onChange={ev=>updEdu(i,"cgpa",ev.target.value)} /></div>
          </div>
        </div>
      ))}
      <button className="rb-add-btn" onClick={addEdu}>+ Add Another Education</button>
      <div className="rb-nav">
        <button className="obtn" onClick={()=>setStep(0)}>← Back</button>
        <button className="pbtn" style={{ width:"auto", padding:"10px 28px" }} onClick={()=>setStep(2)}>Next: Experience →</button>
      </div>
    </div>
  );

  // ── STEP 2: EXPERIENCE ──
  if (step === 2) return (
    <div>
      <div className="ttl">Resume <span>Builder</span></div>
      <div className="sub">// Step 3 of 6 — Work Experience</div>
      <StepBar />
      <div style={{ marginBottom:12, padding:"8px 12px", background:"rgba(0,212,255,.06)", border:"1px solid rgba(0,212,255,.15)", borderRadius:8, fontSize:11, color:"var(--ac)", fontFamily:"Space Mono,monospace" }}>
        💡 No experience yet? Add internships, part-time jobs, or skip to projects
      </div>
      {experience.map((e, i) => (
        <div key={i} className="rb-item">
          {experience.length > 1 && <button className="rb-item-del" onClick={()=>delExp(i)}>×</button>}
          <div className="g2" style={{ gap:9 }}>
            <div><label className="lbl">Job Title</label><input className="inp" placeholder="Software Developer Intern" value={e.title} onChange={ev=>updExp(i,"title",ev.target.value)} /></div>
            <div><label className="lbl">Company</label><input className="inp" placeholder="Zoho Corporation" value={e.company} onChange={ev=>updExp(i,"company",ev.target.value)} /></div>
            <div><label className="lbl">Duration</label><input className="inp" placeholder="Jun 2024 – Aug 2024" value={e.duration} onChange={ev=>updExp(i,"duration",ev.target.value)} /></div>
          </div>
          <div style={{ marginTop:9 }}><label className="lbl">Brief Description</label><textarea className="txa" style={{minHeight:70}} placeholder="What you did, built, or achieved — AI will polish this into strong bullet points" value={e.description} onChange={ev=>updExp(i,"description",ev.target.value)} /></div>
        </div>
      ))}
      <button className="rb-add-btn" onClick={addExp}>+ Add Experience</button>
      <div className="rb-nav">
        <button className="obtn" onClick={()=>setStep(1)}>← Back</button>
        <button className="pbtn" style={{ width:"auto", padding:"10px 28px" }} onClick={()=>setStep(3)}>Next: Projects →</button>
      </div>
    </div>
  );

  // ── STEP 3: PROJECTS ──
  if (step === 3) return (
    <div>
      <div className="ttl">Resume <span>Builder</span></div>
      <div className="sub">// Step 4 of 6 — Projects</div>
      <StepBar />
      {projects.map((p, i) => (
        <div key={i} className="rb-item">
          {projects.length > 1 && <button className="rb-item-del" onClick={()=>delProj(i)}>×</button>}
          <div className="g2" style={{ gap:9 }}>
            <div><label className="lbl">Project Name *</label><input className="inp" placeholder="E-Commerce Website" value={p.name} onChange={e=>updProj(i,"name",e.target.value)} /></div>
            <div><label className="lbl">Tech Stack</label><input className="inp" placeholder="React, Node.js, MongoDB" value={p.tech} onChange={e=>updProj(i,"tech",e.target.value)} /></div>
          </div>
          <div style={{ marginTop:9 }}><label className="lbl">What it does / What you built</label><textarea className="txa" style={{minHeight:70}} placeholder="Describe the project — AI will turn this into impactful bullet points" value={p.description} onChange={e=>updProj(i,"description",e.target.value)} /></div>
        </div>
      ))}
      <button className="rb-add-btn" onClick={addProj}>+ Add Project</button>
      <div className="rb-nav">
        <button className="obtn" onClick={()=>setStep(2)}>← Back</button>
        <button className="pbtn" style={{ width:"auto", padding:"10px 28px" }} onClick={()=>setStep(4)}>Next: Skills →</button>
      </div>
    </div>
  );

  // ── STEP 4: SKILLS ──
  if (step === 4) {
    const SkillSection = ({ label, cat, placeholder }) => {
      const [v, setV] = useState("");
      return (
        <div style={{ marginBottom:14 }}>
          <label className="lbl">{label}</label>
          <div style={{ display:"flex", gap:7 }}>
            <input className="inp" placeholder={placeholder} value={v} onChange={e=>setV(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"||e.key===","){ e.preventDefault(); addSkill(cat,v); setV(""); }}} />
            <button className="pbtn" style={{ width:"auto", padding:"8px 14px" }} onClick={()=>{ addSkill(cat,v); setV(""); }} disabled={!v.trim()}>Add</button>
          </div>
          <div className="rb-skill-tags">
            {skills[cat].map(s => <span key={s} className="rb-skill-tag">{s}<button onClick={()=>delSkill(cat,s)}>×</button></span>)}
          </div>
        </div>
      );
    };
    return (
      <div>
        <div className="ttl">Resume <span>Builder</span></div>
        <div className="sub">// Step 5 of 6 — Skills</div>
        <StepBar />
        <div className="rb-section">
          <SkillSection label="💻 Technical Skills" cat="technical" placeholder="Python, React, SQL… (Enter to add)" />
          <SkillSection label="🛠 Tools & Platforms" cat="tools" placeholder="Git, Docker, Figma… (Enter to add)" />
          <SkillSection label="🌐 Programming Languages" cat="languages" placeholder="Java, C++, JavaScript… (Enter to add)" />
          <SkillSection label="🤝 Soft Skills" cat="soft" placeholder="Leadership, Communication… (Enter to add)" />
        </div>
        {err && <div className="err">❌ {err}</div>}
        <div className="rb-nav">
          <button className="obtn" onClick={()=>setStep(3)}>← Back</button>
          <button className="pbtn" style={{ width:"auto", padding:"10px 28px", background:"linear-gradient(135deg,var(--ac3),#059669)", color:"#fff" }} disabled={loading} onClick={generate}>
            {loading ? <><Spin c="#fff" />Generating Resume…</> : "✨ Generate My Resume"}
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 5: PREVIEW ──
  if (step === 5 && generated) {
    const g = generated;
    const p = g.personal;
    return (
      <div>
        <div className="ttl">Resume <span>Preview</span></div>
        <div className="sub">// AI-generated ATS-ready resume — download as TXT</div>
        <StepBar />
        <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
          <button className="rb-dl-btn" style={{ flex:1, minWidth:180 }} onClick={downloadTxt}>⬇ Download as TXT</button>
          <button className="rb-regen-btn" style={{ flex:1, minWidth:180 }} onClick={()=>setStep(4)}>← Edit & Regenerate</button>
        </div>
        <div className="resume-preview" ref={previewRef}>
          <div className="rp-name">{p.name || "Your Name"}</div>
          <div className="rp-contact">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.linkedin && <span>{p.linkedin}</span>}
            {p.github && <span>{p.github}</span>}
          </div>
          <hr className="rp-divider" />

          {g.summary && (<>
            <div className="rp-section-head">Professional Summary</div>
            <div className="rp-summary">{g.summary}</div>
          </>)}

          {g.experience?.length > 0 && (<>
            <hr className="rp-divider" />
            <div className="rp-section-head">Work Experience</div>
            {g.experience.map((e, i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <div className="rp-job-row">
                  <div className="rp-job-title">{e.title}</div>
                  <div className="rp-job-date">{e.duration}</div>
                </div>
                <div className="rp-job-co">{e.company}</div>
                {e.bullets?.map((b, bi) => <div key={bi} className="rp-bullet">{b}</div>)}
              </div>
            ))}
          </>)}

          {g.education?.length > 0 && (<>
            <hr className="rp-divider" />
            <div className="rp-section-head">Education</div>
            {g.education.map((e, i) => (
              <div key={i} style={{ marginBottom:8 }}>
                <div className="rp-edu-row">
                  <div className="rp-edu-deg">{e.degree}</div>
                  <div className="rp-edu-date">{e.year}</div>
                </div>
                <div className="rp-edu-school">{e.institution}{e.cgpa ? " · CGPA: " + e.cgpa : ""}</div>
              </div>
            ))}
          </>)}

          {g.projects?.length > 0 && (<>
            <hr className="rp-divider" />
            <div className="rp-section-head">Projects</div>
            {g.projects.map((pr, i) => (
              <div key={i} style={{ marginBottom:10 }}>
                <div className="rp-proj-name">{pr.name}{pr.tech ? <span style={{fontWeight:400,fontSize:12,color:"#555"}}> — {pr.tech}</span> : ""}</div>
                {pr.bullets?.map((b, bi) => <div key={bi} className="rp-bullet">{b}</div>)}
              </div>
            ))}
          </>)}

          {(g.skills.technical?.length > 0 || g.skills.tools?.length > 0 || g.skills.languages?.length > 0) && (<>
            <hr className="rp-divider" />
            <div className="rp-section-head">Technical Skills</div>
            {g.skills.languages?.length > 0 && <div style={{marginBottom:4}}><strong style={{fontSize:12}}>Languages: </strong><span style={{fontSize:12,color:"#444"}}>{g.skills.languages.join(", ")}</span></div>}
            {g.skills.technical?.length > 0 && <div style={{marginBottom:4}}><strong style={{fontSize:12}}>Frameworks & Libraries: </strong><span style={{fontSize:12,color:"#444"}}>{g.skills.technical.join(", ")}</span></div>}
            {g.skills.tools?.length > 0 && <div style={{marginBottom:4}}><strong style={{fontSize:12}}>Tools & Platforms: </strong><span style={{fontSize:12,color:"#444"}}>{g.skills.tools.join(", ")}</span></div>}
            {g.skills.soft?.length > 0 && <div><strong style={{fontSize:12}}>Soft Skills: </strong><span style={{fontSize:12,color:"#444"}}>{g.skills.soft.join(", ")}</span></div>}
          </>)}
        </div>
      </div>
    );
  }

  return null;
}

/* ════════════════════════════════════════════════════════════════════════
   APP
════════════════════════════════════════════════════════════════════════ */
const TABS = [
  { id: "skills",  l: "⚡ Skills"        },
  { id: "ats",     l: "📄 ATS Scanner"   },
  { id: "resume",  l: "📝 Resume Builder" },
  { id: "company", l: "🏢 Companies"      },
  { id: "roadmap", l: "🗺️ Roadmap"        },
  { id: "mock",    l: "🎤 Mock Interview" },
  { id: "quiz",    l: "🧠 Aptitude Quiz"  },
];

export default function App() {
  const [tab, setTab] = useState("skills");
  const [showSettings, setShowSettings] = useState(false);
  const [keyInput, setKeyInput] = useState(getApiKey());
  const [hasKey, setHasKey] = useState(Boolean(getApiKey()));

  const saveKey = () => {
    setApiKey(keyInput.trim());
    setHasKey(Boolean(keyInput.trim()));
    setShowSettings(false);
    emitToast(keyInput.trim() ? "Claude API key saved! Live AI activated." : "API key cleared. Switched to Instant Demo Mode.");
  };

  return (
    <>
      <style>{S}</style>
      <Toast />
      <div className="app">
        <header className="hdr">
          <div className="logo">
            <div className="logo-ic">🎯</div>
            <div className="logo-tx">Placement<span>AI</span></div>
          </div>
          <div className="tabs">
            {TABS.map(t => (
              <button key={t.id} className={"tab " + (tab === t.id ? "on" : "")} onClick={() => setTab(t.id)}>{t.l}</button>
            ))}
            <button
              className="tab"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                borderColor: hasKey ? "var(--ac3)" : "var(--bd)",
                color: hasKey ? "var(--ac3)" : "var(--mu)",
                marginLeft: 4,
                border: "1px solid"
              }}
              onClick={() => setShowSettings(true)}
              title="Configure Anthropic API Key or Demo Mode"
            >
              <span>⚙️</span>
              <span>{hasKey ? "Live AI Active" : "Demo Mode"}</span>
            </button>
          </div>
        </header>

        {showSettings && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,12,20,0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20
          }}>
            <div className="bx" style={{ maxWidth: 480, width: "100%", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 17, fontWeight: 800 }}>⚙️ AI Provider Settings</div>
                <button className="obtn" onClick={() => setShowSettings(false)}>✕</button>
              </div>
              <div style={{ fontSize: 12, color: "var(--mu)", lineHeight: 1.6, marginBottom: 14 }}>
                PlacementAI works in <strong>Instant Demo Mode</strong> right out of the box with realistic mock responses.
                To connect live <strong>Claude 3.5 Sonnet</strong>, provide your Anthropic API key below.
              </div>
              <label className="lbl">Anthropic API Key</label>
              <input
                type="password"
                className="inp"
                placeholder="sk-ant-api03-..."
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                style={{ marginBottom: 14 }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button className="pbtn" onClick={saveKey}>Save Settings</button>
                {hasKey && (
                  <button className="obtn" onClick={() => { setKeyInput(""); setApiKey(""); setHasKey(false); setShowSettings(false); emitToast("Switched to Demo Mode"); }}>
                    Clear Key
                  </button>
                )}
                <button className="obtn" onClick={() => setShowSettings(false)}>Cancel</button>
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: "var(--mu)", fontFamily: "Space Mono,monospace" }}>
                🔒 Key is stored locally in your browser's localStorage.
              </div>
            </div>
          </div>
        )}

        <main className="wrap">
          {tab === "skills"  && <SkillMatcher />}
          {tab === "ats"     && <ATSScanner />}
          {tab === "resume"  && <ResumeBuilder />}
          {tab === "company" && <CompanyGuide />}
          {tab === "roadmap" && <RoadmapPlanner />}
          {tab === "mock"    && <MockInterview />}
          {tab === "quiz"    && <AptitudeQuiz />}
        </main>
      </div>
    </>
  );
}
