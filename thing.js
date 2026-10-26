
var STEPS=[
 {k:"blessings",c:"#ff2d78",ico:"🙏",title:"Three blessings",sub:"What are you grateful for right now?",n:3},
 {k:"political",c:"#3b82f6",ico:"🏛️",title:"Political news",sub:"Three headlines worth remembering.",n:3},
 {k:"military",c:"#22a35a",ico:"🛡️",title:"Military news",sub:"Three headlines worth remembering.",n:3},
 {k:"economic",c:"#f59e0b",ico:"📈",title:"Economic news",sub:"Three headlines worth remembering.",n:3},
 {k:"videos",c:"#a855f7",ico:"🎬",title:"Three video ideas",sub:"What could you make next?",n:3},
 {k:"when",c:"#14b8a6",ico:"🗓️",title:"Date & day",sub:"Type it out yourself — no autofill.",fields:["Date (e.g. October 26, 2026)","Day of the week"]},
 {k:"why",c:"#ef4444",ico:"🔥",title:"Why are you doing this?",sub:"Write it in your own words.",long:true}
];

var COL={};
STEPS.forEach(function(s){COL[s.k]=s.c});

var LISTK=["blessings","political","military","economic","videos"];
var NAME={blessings:"Blessings",political:"Political",military:"Military",economic:"Economic",videos:"Videos"};
var DEFAULT_LIST=["Pray / reflect","Exercise","Read 10 pages","Work on video","Drink water","Plan tomorrow"];

function load(k,d){
 try{
  var v=localStorage.getItem(k);
  return v?JSON.parse(v):d;
 }catch(e){return d}
}

var ts=0,DB=null,DREF=null,tmr=null;

function setSt(t){
 var e=document.getElementById("st");
 if(e)e.textContent=t;
}

function save(k,v){
 try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}
 ts=Date.now();
 try{localStorage.setItem("dr:ts",ts)}catch(e){}
 clearTimeout(tmr);
 tmr=setTimeout(push,500);
}

function push(){
 if(!DREF){
  setSt(DB===false?"Device only":"");
  return;
 }
 DREF.set({
  json:JSON.stringify({
   entries:entries,
   list:list,
   checks:checks,
   objs:objs,
   deadlines:deadlines,
   ts:ts
  })
 }).then(function(){
  setSt("☁︎ Saved");
 }).catch(function(){
  setSt("Device only");
 });
}

function ymd(d){
 return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

var now=new Date();
var today=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");

function tick(){
 var n=new Date();
 document.getElementById("clock").textContent=
  n.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})+
  " · "+
  n.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
}

tick();
setInterval(tick,1000);

var entries=load("dr:entries",{});
var list=load("dr:list",DEFAULT_LIST);
var checks=load("dr:checks",{});
var objs=load("dr:objs",{});
var deadlines=load("dr:deadlines",[]);

ts=+load("dr:ts",0)||0;

var step=0,draft={},app=document.getElementById("app"),shown=0,raf=0,FIRST=true;

function ring(to){
 var rf=document.getElementById("rf");
 var gl=document.getElementById("gl");
 var sn=document.getElementById("sn");

 if(!rf)return;

 cancelAnimationFrame(raf);

 var C=263.9,from=shown,t0=null,dur=FIRST?1500:700;
 var rm=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;

 function draw(v){
  var g=gradeOf(v);
  rf.style.strokeDashoffset=C*(1-v/100);
  rf.style.stroke=v>0?g[1]:"var(--line)";
  gl.textContent=g[0];
  gl.style.color=g[1];
  sn.textContent=Math.round(v)+" / 100";
 }

 draw(from);

 if(rm){
  shown=to;
  draw(to);
  return;
 }

 function f(t){
  if(t0===null)t0=t;
  var p=Math.min(1,(t-t0)/dur);
  var e=1-Math.pow(1-p,3);
  var v=from+(to-from)*e;
  shown=v;
  draw(v);
  if(p<1)raf=requestAnimationFrame(f);
 }

 raf=requestAnimationFrame(f);
}

function esc(s){
 return String(s).replace(/[&<>"]/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];
 });
}

function frac(e,k){
 var a=(e&&e[k])||[];
 return a.filter(function(x){return x&&x.trim()}).length/3;
}

function cdone(d){
 return(checks[d]||[]).filter(function(i){return i<list.length}).length;
}

function cfrac(d){
 return list.length?cdone(d)/list.length:1;
}

function scoreOf(e,d){
 var p={};
 LISTK.forEach(function(k){
  p[k]=Math.round(frac(e,k)*4);
 });

 p.log=((e.when&&e.when[0]&&e.when[1])?2:0)+
       ((e.why&&e.why[0])?3:0);

 p.todo=Math.round(75*cfrac(d)*cfrac(d));

 var t=0;
 for(var k in p)t+=p[k];

 return{p:p,t:t};
}

function gradeOf(t){
 return t>=95?["A","#22a35a"]:
        t>=85?["B","#3b82f6"]:
        t>=75?["C","#f59e0b"]:
        t>=60?["D","#f97316"]:
        ["F","#e5383b"];
}

function body(e,d){
 function f(c,fr){
  return'fill="'+c+'" fill-opacity="'+(.15+.85*fr).toFixed(2)+'"';
 }

 var st='stroke="currentColor" stroke-opacity=".25" stroke-width="1.5"';
 var A=f(COL.military,frac(e,"military"));
 var legs=f("#e8a900",cfrac(d));

 return'<svg viewBox="0 0 100 220" role="img" aria-label="Body score graphic">'+
 '<circle cx="50" cy="20" r="14" '+f(COL.political,frac(e,"political"))+' '+st+'/>'+
 '<rect x="45" y="33" width="10" height="9" rx="3" fill="currentColor" fill-opacity=".15"/>'+
 '<rect x="16" y="44" width="13" height="62" rx="6.5" '+A+' '+st+'/>'+
 '<rect x="71" y="44" width="13" height="62" rx="6.5" '+A+' '+st+'/>'+
 '<rect x="30" y="42" width="40" height="40" rx="12" '+f(COL.blessings,frac(e,"blessings"))+' '+st+'/>'+
 '<path d="M50 72c-9-6-12-10-12-14a6 6 0 0 1 12-1 6 6 0 0 1 12 1c0 4-3 8-12 14z" fill="#fff" fill-opacity=".85"/>'+
 '<rect x="34" y="84" width="32" height="38" rx="10" '+f(COL.economic,frac(e,"economic"))+' '+st+'/>'+
 '<circle cx="22" cy="113" r="8" '+f(COL.videos,frac(e,"videos"))+' '+st+'/>'+
 '<circle cx="78" cy="113" r="8" '+f(COL.videos,frac(e,"videos"))+' '+st+'/>'+
 '<rect x="34" y="124" width="14" height="86" rx="7" '+legs+' '+st+'/>'+
 '<rect x="52" y="124" width="14" height="86" rx="7" '+legs+' '+st+'/></svg>';
}

function nd(s){
 var x=new Date(s+"T12:00:00");
 x.setDate(x.getDate()+1);
 return ymd(x);
}

function qual(d){
 var e=entries[d];
 if(e&&e.done)return true;
 return list.length>0&&cdone(d)/list.length>=.8;
}

function streaks(){
 var ks={};

 Object.keys(entries).concat(Object.keys(checks)).forEach(function(k){
  if(qual(k))ks[k]=1;
 });

 var ds=Object.keys(ks).sort(),l=0,run=0,prev=null;

 ds.forEach(function(d){
  run=(prev&&nd(prev)===d)?run+1:1;
  if(run>l)l=run;
  prev=d;
 });

 var c=0,d=new Date(now);

 if(!ks[today])d.setDate(d.getDate()-1);

 while(ks[ymd(d)]){
  c++;
  d.setDate(d.getDate()-1);
 }

 return{c:c,l:l};
}

function ob(d){
 return objs[d]||(objs[d]={
  o:[{t:"",d:0},{t:"",d:0},{t:"",d:0}],
  m:{t:"",d:0}
 });
}

function tasksOf(d){
 var r=objs[d];
 if(!r)return[];

 return r.o.concat([r.m]).filter(function(x){
  return x.t&&x.t.trim();
 });
}

function daysTo(d){
 return Math.round(
  (new Date(d+"T12:00:00")-new Date(today+"T12:00:00"))/864e5
 );
}

function render(){
 step<STEPS.length?ask():dash();
}

function ask(){
 var s=STEPS[step],cur=draft[s.k]||[],bars="";

 for(var i=0;i<STEPS.length;i++){
  bars+='<i style="'+(i<=step?'background:'+STEPS[i].c:'')+'"></i>';
 }

 var h='<div class="prog">'+bars+'</div>'+
 '<div class="stage" style="--c:'+s.c+'">'+
 '<div class="ico">'+s.ico+'</div>'+
 '<h1>'+s.title+'</h1>'+
 '<p class="sub">'+s.sub+'</p>'+
 (s.k=="blessings"?ycard(prior()):"");

 if(s.n){
  for(var j=0;j<s.n;j++){
   h+='<input data-i="'+j+'" placeholder="'+(j+1)+'." value="'+esc(cur[j]||"")+'">';
  }
 }else if(s.fields){
  s.fields.forEach(function(f,j){
   h+='<input data-i="'+j+'" placeholder="'+f+'" value="'+esc(cur[j]||"")+'">';
  });
 }else{
  h+='<textarea data-i="0" placeholder="Because…">'+esc(cur[0]||"")+'</textarea>';
 }

 h+='<p class="err" id="err"></p><div class="row">'+
 (step>0?'<button class="btn ghost" id="back">‹ Back</button>':'')+
 '<button class="btn" id="next">'+
 (step==STEPS.length-1?"Finish":"Next →")+
 '</button></div></div>';

 app.innerHTML=h;

 var f=app.querySelector("input,textarea");
 if(f)f.focus();

 function grab(){
  return Array.prototype.map.call(
   app.querySelectorAll("[data-i]"),
   function(e){return e.value.trim()}
  );
 }

 document.getElementById("next").onclick=function(){
  var v=grab();

  if(v.some(function(x){return !x})){
   document.getElementById("err").textContent="Fill in every field to continue.";
   return;
  }

  draft[s.k]=v;

  if(step==STEPS.length-1){
   draft.done=true;
   draft.date=today;
   entries[today]=draft;
   save("dr:entries",entries);
  }

  step++;
  render();
  window.scrollTo(0,0);
 };

 var b=document.getElementById("back");

 if(b)b.onclick=function(){
  draft[s.k]=grab();
  step--;
  render();
 };
}

var yd=new Date(now);
yd.setDate(yd.getDate()-1);
var YEST=ymd(yd);

function ycard(p){
 if(!p||!p.blessings)return"";

 var lab=p.date===YEST?
  "Yesterday’s blessings":
  "Last blessings · "+esc((p.when||[])[0]||p.date);

 return'<div class="card bl" style="--c:'+COL.blessings+'">'+
 '<h2>⏮ '+lab+'</h2><ol>'+
 p.blessings.map(function(x){return'<li>'+esc(x)+'</li>'}).join("")+
 '</ol></div>';
}

function prior(){
 var ks=Object.keys(entries).filter(function(k){return k<today}).sort();
 return ks.length?entries[ks[ks.length-1]]:null;
}

function block(e){
 return LISTK.map(function(k){
  return'<h3 style="color:'+COL[k]+'">'+NAME[k]+'</h3><ol>'+
  (e[k]||[]).map(function(x){return'<li>'+esc(x)+'</li>'}).join("")+
  '</ol>';
 }).join("");
}

function dash(){
 var e=entries[today]||draft;
 var sc=scoreOf(e,today);
 var g=gradeOf(sc.t);
 var p=prior();

 var un=list.length-cdone(today);

 var msg=un?
  '<b style="color:var(--bad)">'+un+' unchecked</b> — costing you '+
  (75-sc.p.todo)+' points. The checklist is 75% of your grade.':
  'Checklist complete. Nothing is costing you points. 💪';

 var legend=LISTK.map(function(k){
  return'<div><i style="background:'+COL[k]+'"></i>'+
  NAME[k].slice(0,5)+'<span>'+sc.p[k]+'/4</span></div>';
 }).join("")+
 '<div><i style="background:'+COL.when+'"></i>Log<span>'+sc.p.log+'/5</span></div>'+
 '<div><i style="background:var(--gold)"></i>To-do<span>'+sc.p.todo+'/75</span></div>';

 var sk=streaks();
 var tk=tasksOf(today);
 var td=tk.filter(function(x){return x.d}).length;

 var up=deadlines.filter(function(x){return x.d>=today})
  .sort(function(a,b){return a.d<b.d?-1:1})[0];

 var O=objs[today]||{
  o:[{t:"",d:0},{t:"",d:0},{t:"",d:0}],
  m:{t:"",d:0}
 };

 var stats='<div class="stats">'+
 '<div class="stat" style="--sc:#f97316"><b>🔥 '+sk.c+
 '</b><span>Streak · best '+sk.l+'</span></div>'+
 '<div class="stat" style="--sc:#22a35a"><b>'+td+' / '+tk.length+
 '</b><span>Tasks done</span></div>'+
 '<div class="stat" style="--sc:#ef4444"><b>'+
 (up?daysTo(up.d)+(daysTo(up.d)==1?' day':' days'):'—')+
 '</b><span>'+(up?esc(up.t):'No deadline set')+'</span></div></div>';

 function orow(o,key,ph){
  return'<div class="item'+(o.d?' done':'')+'">'+
  '<button class="chk" data-o="'+key+'" aria-label="toggle"></button>'+
  '<input class="oi" data-ot="'+key+'" placeholder="'+ph+
  '" value="'+esc(o.t||"")+'"></div>';
 }

 var objc='<div class="card" style="padding-top:8px">'+
 '<h2 style="color:#3b82f6;margin-top:6px">🎯 Today’s objectives</h2>'+
 O.o.map(function(o,i){return orow(o,i,"Objective "+(i+1))}).join("")+
 orow(O.m,"m","★ Most important task")+'</div>';

 var dsc='<div class="card"><h2 style="color:#ef4444">⏳ Deadlines</h2>'+
 deadlines.slice().sort(function(a,b){return a.d<b.d?-1:1})
 .map(function(x){
  var n=daysTo(x.d);
  return'<div class="ds"><span class="t">'+esc(x.t)+'</span>'+
  '<span style="font-size:13px;color:'+(n<0?'var(--bad)':'var(--muted)')+'">'+
  (n<0?'overdue '+(-n)+'d':n==0?'today':n+'d')+
  ' · '+esc(x.d)+'</span>'+
  '<button class="x" data-dx="'+x.id+'" aria-label="delete deadline">×</button></div>';
 }).join("")+
 (deadlines.length?'':'<div style="color:var(--muted);font-size:14px">No deadlines yet — add one to see a countdown.</div>')+
 '<div class="add"><input id="dt" placeholder="Deadline name">'+
 '<input id="dd" type="date" style="flex:0 0 150px">'+
 '<button class="btn" id="dadd">Add</button></div></div>';

 var h='<div class="stage'+(FIRST?'':' still')+'">'+
 '<p class="meta">'+esc((e.when||[])[1]||"")+' · '+
 esc((e.when||[])[0]||today)+'</p>'+
 '<h1 style="color:var(--text)">Today</h1>'+
 '<p class="sub" style="margin-bottom:14px">'+msg+'</p>'+
 '<div class="dash'+(FIRST?' first':'')+'"><div>';

 h+=stats;
 h+=ycard(p);

 h+='<div class="card bl" style="--c:'+COL.blessings+'">'+
 '<h2>🙏 Today’s blessings</h2><ol>'+
 (e.blessings||[]).map(function(x){return'<li>'+esc(x)+'</li>'}).join("")+
 '</ol></div>';

 h+=objc;
 h+='<div class="notes">';

 list.forEach(function(t,i){
  var d=(checks[today]||[]).indexOf(i)>-1;

  h+='<div class="item'+(d?' done':'')+'">'+
  '<button class="chk" data-c="'+i+'" aria-label="toggle"></button>'+
  '<span class="t">'+esc(t)+'</span>'+
  '<button class="x" data-x="'+i+'" aria-label="delete">×</button></div>';
 });

 h+='</div><div class="add"><input id="new" placeholder="New checklist item">'+
 '<button class="btn" id="addb">Add</button></div>';

 h+=dsc;

 if(e.why){
  h+='<details><summary style="color:'+COL.why+'">🔥 Why I’m doing this</summary>'+
  '<p>'+esc(e.why[0])+'</p></details>';
 }

 if(p){
  var ps=scoreOf(p,p.date);

  h+='<details><summary>⏮ '+
  esc((p.when||[])[0]||p.date)+' — grade '+gradeOf(ps.t)[0]+
  ' ('+ps.t+')</summary>'+block(p)+'</details>';
 }

 h+='<details><summary>📝 Today’s entries</summary>'+
 block(e)+'</details>'+
 '<button class="link" id="redo">Redo today’s questions</button></div>';

 h+='<div class="side" style="--gc:'+g[1]+'">'+
 '<div class="ringw"><svg class="ring" viewBox="0 0 100 100" role="img" aria-label="Score ring">'+
 '<circle class="rb" cx="50" cy="50" r="42"/>'+
 '<circle class="rf" id="rf" cx="50" cy="50" r="42" transform="rotate(-90 50 50)"/>'+
 '</svg><div class="rc"><b id="gl">F</b><span id="sn">0 / 100</span></div></div>'+
 body(e,today)+'<div class="leg">'+legend+'</div></div></div></div>';

 app.innerHTML=h;
 ring(sc.t);
 FIRST=false;

 Array.prototype.forEach.call(app.querySelectorAll("[data-c]"),function(b){
  b.onclick=function(){
   var i=+b.dataset.c;
   var a=checks[today]||[];
   var j=a.indexOf(i);

   j>-1?a.splice(j,1):a.push(i);
   checks[today]=a;
   save("dr:checks",checks);
   dash();
  };
 });

 Array.prototype.forEach.call(app.querySelectorAll("[data-x]"),function(b){
  b.onclick=function(){
   var i=+b.dataset.x;

   list.splice(i,1);

   checks[today]=(checks[today]||[])
    .filter(function(n){return n!=i})
    .map(function(n){return n>i?n-1:n});

   save("dr:list",list);
   save("dr:checks",checks);
   dash();
  };
 });

 Array.prototype.forEach.call(app.querySelectorAll("[data-o]"),function(b){
  b.onclick=function(){
   var k=b.dataset.o;
   var r=ob(today);
   var t=k=="m"?r.m:r.o[+k];

   t.d=t.d?0:1;
   save("dr:objs",objs);
   dash();
  };
 });

 Array.prototype.forEach.call(app.querySelectorAll("[data-ot]"),function(i){
  i.oninput=function(){
   var k=i.dataset.ot;
   var r=ob(today);
   var t=k=="m"?r.m:r.o[+k];

   t.t=i.value;
   save("dr:objs",objs);
  };

  i.onchange=function(){dash()};
 });

 Array.prototype.forEach.call(app.querySelectorAll("[data-dx]"),function(b){
  b.onclick=function(){
   deadlines=deadlines.filter(function(x){return x.id!=b.dataset.dx});
   save("dr:deadlines",deadlines);
   dash();
  };
 });

 document.getElementById("dadd").onclick=function(){
  var t=document.getElementById("dt").value.trim();
  var d=document.getElementById("dd").value;

  if(!t||!d)return;

  deadlines.push({id:Date.now().toString(36),t:t,d:d});
  save("dr:deadlines",deadlines);
  dash();
 };

 function add(){
  var v=document.getElementById("new").value.trim();

  if(v){
   list.push(v);
   save("dr:list",list);
   dash();
  }
 }

 document.getElementById("addb").onclick=add;

 document.getElementById("new").onkeydown=function(ev){
  if(ev.key=="Enter")add();
 };

 document.getElementById("redo").onclick=function(){
  draft=JSON.parse(JSON.stringify(entries[today]||{}));
  step=0;
  render();
 };
}

if(entries[today]&&entries[today].done){
 draft=entries[today];
 step=STEPS.length;
}

render();

function refreshAfterSync(){
 var t=entries[today];

 var fresh=step==0&&
  Array.prototype.every.call(
   app.querySelectorAll("input,textarea"),
   function(e){return !e.value}
  );

 if(step>=STEPS.length||fresh){
  if(t&&t.done){
   draft=t;
   step=STEPS.length;
  }else{
   draft={};
   step=0;
  }

  render();
 }
}

(function(){
 try{
  if(!window.claude){
   DB=false;
   setSt("Device only");
   return;
  }

  Promise.all([claude.use("db"),claude.use("user")])
  .then(function(r){
   var db=r[0],u=r[1];

   if(!db||!u)throw 0;

   return u.id().then(function(id){
    if(!id)throw 0;

    DREF=db.doc("data/users/"+id+"/state");
    return DREF.get();
   });
  })
  .then(function(snap){
   var r=null;

   if(snap.exists){
    try{r=JSON.parse(snap.data().json)}catch(e){}
   }

   if(r&&r.ts>ts){
    entries=r.entries||{};
    list=r.list||list;
    checks=r.checks||{};
    objs=r.objs||{};
    deadlines=r.deadlines||[];
    ts=r.ts;

    try{
     localStorage.setItem("dr:entries",JSON.stringify(entries));
     localStorage.setItem("dr:list",JSON.stringify(list));
     localStorage.setItem("dr:checks",JSON.stringify(checks));
     localStorage.setItem("dr:objs",JSON.stringify(objs));
     localStorage.setItem("dr:deadlines",JSON.stringify(deadlines));
     localStorage.setItem("dr:ts",ts);
    }catch(e){}

    setSt("☁︎ Saved");
    refreshAfterSync();
   }else{
    push();
   }
  })
  .catch(function(){
   DB=false;
   setSt("Device only");
  });
 }catch(e){
  DB=false;
  setSt("Device only");
 }
})();

setInterval(function(){
 if(ymd(new Date())!==today)location.reload();
},60000);
