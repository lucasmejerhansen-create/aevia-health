/* Aevia ordbog: gør svære termer klikbare med en kort forklaring. Selvstændig, ingen afhængigheder. */
(function(){
  var DA={
    "biologisk alder":"Et mål for, hvor gammel din krop fungerer som, uafhængigt af din fødselsdato.",
    "biomarkør":"En målbar værdi i blodet, der fortæller noget om dit helbred.",
    "biomarkører":"Målbare værdier i blodet, der fortæller noget om dit helbred.",
    "ApoB":"Antallet af skadelige kolesterolpartikler, et af de mest præcise mål for hjerte kar risiko.",
    "Lp(a)":"En arvelig type kolesterol, der øger risikoen for hjerte kar sygdom.",
    "LDL":"Det skadelige kolesterol, der kan aflejre sig i blodårerne.",
    "HDL":"Det beskyttende kolesterol, der fjerner overskydende fedt fra blodet.",
    "HbA1c":"Dit gennemsnitlige blodsukker over de seneste 2-3 måneder.",
    "hs-CRP":"En følsom markør for skjult, kronisk inflammation i kroppen.",
    "VO2max":"Hvor effektivt din krop optager ilt, det stærkeste enkeltmål for kondition.",
    "eGFR":"Et mål for, hvor godt dine nyrer renser blodet.",
    "insulinresistens":"Når cellerne reagerer dårligere på insulin, et tidligt trin mod type 2-diabetes.",
    "homocystein":"En aminosyre, der ved høje niveauer øger risiko for hjerte og hjerne.",
    "ferritin":"Kroppens jernlager, også en markør for inflammation.",
    "kortisol":"Stresshormonet, der påvirker energi, søvn, vægt og immunforsvar.",
    "østradiol":"Det vigtigste østrogen (kønshormon), centralt for knogler og hjerte.",
    "testosteron":"Kønshormon vigtigt for muskler, energi og libido, hos både mænd og kvinder.",
    "SHBG":"Et protein, der binder kønshormoner og styrer, hvor meget der er aktivt.",
    "triglycerider":"Fedtstoffer i blodet, knyttet til kost, vægt og hjerte kar risiko.",
    "inflammation":"Betændelsestilstand i kroppen, kronisk lavgradig inflammation fremskynder aldring.",
    "epigenetik":"Hvordan livsstil tænder og slukker for dine gener, bruges til at måle biologisk alder.",
    "TSH":"Hjernens signal til skjoldbruskkirtlen, det primære mål for stofskiftet.",
    "IGF-1":"Et væksthormon-relateret signal, knyttet til aldring og muskelmasse.",
    "metabolisk":"Som handler om kroppens omsætning af energi, altså stofskiftet.",
    "longevity":"Et langt og sundt liv, med fokus på at forlænge de raske år.",
    "ApoA1":"Proteinet i det gode kolesterol, afspejler din beskyttelse mod åreforkalkning."
  };
  var EN={
    "biological age":"A measure of how old your body functions, independent of your date of birth.",
    "biomarker":"A measurable value in the blood that tells you something about your health.",
    "biomarkers":"Measurable values in the blood that tell you something about your health.",
    "ApoB":"The number of harmful cholesterol particles, one of the most accurate measures of cardiovascular risk.",
    "Lp(a)":"An inherited type of cholesterol that raises cardiovascular risk.",
    "LDL":"The harmful cholesterol that can build up in your arteries.",
    "HDL":"The protective cholesterol that clears excess fat from the blood.",
    "HbA1c":"Your average blood sugar over the past 2-3 months.",
    "hs-CRP":"A sensitive marker for hidden, chronic inflammation in the body.",
    "VO2max":"How efficiently your body uses oxygen, the strongest single measure of fitness.",
    "eGFR":"A measure of how well your kidneys clean the blood.",
    "insulin resistance":"When cells respond less to insulin, an early step toward type 2 diabetes.",
    "homocysteine":"An amino acid that, when high, raises heart and brain risk.",
    "ferritin":"Your iron store, also a marker of inflammation.",
    "cortisol":"The stress hormone, affecting energy, sleep, weight and immunity.",
    "estradiol":"The main estrogen (sex hormone), central to bones and heart.",
    "testosterone":"A sex hormone important for muscle, energy and libido, in both sexes.",
    "SHBG":"A protein that binds sex hormones and controls how much is active.",
    "triglycerides":"Fats in the blood, linked to diet, weight and cardiovascular risk.",
    "inflammation":"An inflammatory state in the body, chronic low-grade inflammation accelerates ageing.",
    "epigenetics":"How lifestyle switches your genes on and off, used to measure biological age.",
    "TSH":"The brain signal to the thyroid, the main measure of metabolism.",
    "IGF-1":"A growth-hormone-related signal, linked to ageing and muscle mass.",
    "longevity":"A long and healthy life, focused on extending the healthy years.",
    "ApoA1":"The protein in good cholesterol, reflecting your protection against artery disease."
  };
  var lang=(document.documentElement.lang||"da").slice(0,2);
  var T=lang==="en"?EN:DA;
  var keys=Object.keys(T).sort(function(a,b){return b.length-a.length;});
  var seen={};
  function isAlnum(ch){return ch && /[A-Za-z0-9À-ſ]/.test(ch);}
  function findTerm(text,from){
    var best=null;
    for(var i=0;i<keys.length;i++){
      var k=keys[i]; if(seen[k])continue;
      var idx=text.toLowerCase().indexOf(k.toLowerCase(),from);
      while(idx>=0){
        var b=text[idx-1], a=text[idx+k.length];
        if(!isAlnum(b)&&!isAlnum(a)){ if(best===null||idx<best.idx||(idx===best.idx&&k.length>best.k.length))best={idx:idx,k:k}; break; }
        idx=text.toLowerCase().indexOf(k.toLowerCase(),idx+1);
      }
    }
    return best;
  }
  function process(node){
    var text=node.nodeValue, frag=null, last=0, pos=0, m;
    while((m=findTerm(text,pos))){
      frag=frag||document.createDocumentFragment();
      if(m.idx>last)frag.appendChild(document.createTextNode(text.slice(last,m.idx)));
      var label=text.substr(m.idx,m.k.length);
      var btn=document.createElement("button");
      btn.type="button"; btn.className="term"; btn.setAttribute("data-d",T[m.k]); btn.textContent=label;
      frag.appendChild(btn); seen[m.k]=1; last=m.idx+m.k.length; pos=last;
    }
    if(frag){ if(last<text.length)frag.appendChild(document.createTextNode(text.slice(last))); node.parentNode.replaceChild(frag,node); }
  }
  function run(){
    var st=document.createElement("style");
    st.textContent=".term{cursor:help;color:inherit;background:none;border:none;padding:0;font:inherit;border-bottom:1px dotted rgba(201,164,55,.6)}.term:hover{border-bottom-color:#c9a437}#glossary-pop{position:absolute;z-index:600;max-width:280px;background:#0f1f36;color:#f5f5f0;border:1px solid #c9a437;border-radius:10px;padding:12px 14px;font-size:.9rem;line-height:1.5;box-shadow:0 12px 30px rgba(0,0,0,.45);display:none}#glossary-pop .gt{font-weight:600;color:#c9a437;display:block;margin-bottom:4px;font-size:.85rem;letter-spacing:.02em}";
    document.head.appendChild(st);
    var els=document.querySelectorAll("p, li"), nodes=[];
    els.forEach(function(el){
      if(el.closest("a,button,#aevc-panel,.term,.disc"))return;
      for(var c=el.firstChild;c;c=c.nextSibling){ if(c.nodeType===3 && c.nodeValue && c.nodeValue.trim().length>2) nodes.push(c); }
    });
    nodes.forEach(process);
    var pop=document.createElement("div"); pop.id="glossary-pop"; document.body.appendChild(pop);
    document.addEventListener("click",function(e){
      var t=e.target.closest?e.target.closest(".term"):null;
      if(t){ e.preventDefault();
        pop.innerHTML=""; var gt=document.createElement("span"); gt.className="gt"; gt.textContent=t.textContent;
        pop.appendChild(gt); pop.appendChild(document.createTextNode(t.getAttribute("data-d"))); pop.style.display="block";
        var r=t.getBoundingClientRect(); var top=r.bottom+window.scrollY+6; pop.style.left="0px"; pop.style.top="0px";
        var pw=pop.offsetWidth, vw=document.documentElement.clientWidth; var left=r.left+window.scrollX;
        if(left+pw>window.scrollX+vw-12)left=window.scrollX+vw-pw-12; if(left<8)left=8;
        pop.style.left=left+"px"; pop.style.top=top+"px";
      } else if(!(e.target.closest&&e.target.closest("#glossary-pop"))){ pop.style.display="none"; }
    });
    window.addEventListener("scroll",function(){pop.style.display="none";},{passive:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run); else run();
})();
