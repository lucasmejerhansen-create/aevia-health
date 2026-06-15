/* Nuvera markør-motor — ÉN kilde til tærskler.
 * Optimal-zoner er porteret 1:1 fra Aevias validerede panel:
 *   lib/aevia-engine/src/reference-data.ts (MARKERS + FEMALE_OPTIMAL).
 * Klassificeringen følger samme model som engine'ens classify.ts:
 *   AI/regler klassificerer aldrig kreativt — status afgøres af optimal-zonen.
 * DOSE-MAPPINGEN (SUPP) er Nuveras tilskuds-lag og KRÆVER klinisk validering
 * (samme princip som engine'en: læge godkender til sidst).
 */
window.NuveraEngine = (function () {
  // dir 'low' = lavere er bedre (kun høj side eskalerer) · 'high' = gulv (kun lav side eskalerer)
  var M = {
    vitd:        { label:'D-vitamin',     unit:'nmol/L',   ol:75,  oh:120, dir:'high' },
    ldl:         { label:'LDL-kolesterol',unit:'mmol/L',   ol:1.0, oh:2.6, dir:'low'  },
    apob:        { label:'ApoB',          unit:'g/L',      ol:0.4, oh:0.8, dir:'low'  },
    hscrp:       { label:'hs-CRP',        unit:'mg/L',     ol:0,   oh:1.0, dir:'low'  },
    hba1c:       { label:'HbA1c',         unit:'mmol/mol', ol:28,  oh:35,  dir:'low'  },
    homocystein: { label:'Homocystein',   unit:'µmol/L',   ol:5,   oh:9,   dir:'low'  },
    ferritin:    { label:'Ferritin',      unit:'µg/L',     ol:50,  oh:150, olF:40, ohF:120, dir:'high' },
    magnesium:   { label:'Magnesium',     unit:'mmol/L',   ol:0.85,oh:1.0, dir:'high' },
    b12:         { label:'B12',           unit:'pmol/L',   ol:350, oh:650, dir:'high' },
    folat:       { label:'Folat',         unit:'nmol/L',   ol:15,  oh:35,  dir:'high' },
    testosteron: { label:'Testosteron',   unit:'nmol/L',   ol:15,  oh:30,  olF:0.7, ohF:2.0, dir:'high' },
    tsh:         { label:'TSH',           unit:'mIU/L',    ol:0.5, oh:2.5, dir:'low'  }
  };
  var ORDER = ['vitd','ldl','apob','hscrp','hba1c','homocystein','ferritin','magnesium','b12','folat','testosteron','tsh'];

  function zone(key, sex){ var m=M[key]; if(sex==='kvinde' && m.olF!=null) return [m.olF, m.ohF]; return [m.ol, m.oh]; }

  // status: 'optimal' | 'suboptimal' | 'action' (+ side på den handlingskrævende side)
  function classify(key, val, sex){
    var m=M[key]; if(!m || !isFinite(val)) return null;
    var z=zone(key,sex), lo=z[0], hi=z[1];
    if(val>=lo && val<=hi) return { status:'optimal', zone:z };
    if(val<lo){
      if(m.dir==='low') return { status:'optimal', zone:z };           // lav side fri
      return { status: (val>=lo*0.8?'suboptimal':'action'), side:'low', zone:z };
    }
    if(m.dir==='high') return { status:'optimal', zone:z };             // høj side fri (gulv-markør)
    return { status: (val<=hi*1.25?'suboptimal':'action'), side:'high', zone:z };
  }

  // Tilskuds-lag (kræver klinisk validering). Returnerer [{n,a,w,cap}].
  var SUPP = {
    vitd: function(v){ return [{n:'D3 + K2', a:(v<50?'90 µg':'50 µg'), w:'D-vitamin under optimal ('+v+')'}]; },
    ldl: function(v){ return [{n:'Bergamot',a:'500 mg',w:'LDL over optimal ('+v+')'},{n:'Omega-3',a:'2 g',w:'lipider',cap:true},{n:'Plantesteroler',a:'2 g',w:'kolesterol-optag'}]; },
    apob: function(v){ return [{n:'Bergamot',a:'500 mg',w:'ApoB over optimal ('+v+')'},{n:'Omega-3',a:'2 g',w:'apoB/lipider',cap:true}]; },
    hscrp: function(v){ var o=[{n:'Omega-3',a:'2 g',w:'hs-CRP over optimal ('+v+')',cap:true}]; if(v>=3)o.push({n:'Curcumin',a:'1 g',w:'høj inflammation'}); return o; },
    hba1c: function(v){ return [{n:'Berberin',a:'2× 500 mg',w:'HbA1c over optimal ('+v+')'},{n:'Magnesium glycinat',a:'300 mg',w:'insulinfølsomhed'}]; },
    homocystein: function(v){ return [{n:'B-kompleks',a:'1 ×',w:'homocystein over optimal ('+v+') · folat+B12'}]; },
    ferritin: function(v){ if(v<30) return [{n:'Jern (bisglycinat)',a:'25 mg',w:'ferritin lavt ('+v+') — bekræftet ved test'},{n:'C-vitamin',a:'200 mg',w:'øger jernoptag'}]; return []; },
    magnesium: function(v){ return [{n:'Magnesium glycinat',a:'300 mg',w:'magnesium under optimal ('+v+')'}]; },
    b12: function(v){ return [{n:'B12 (methylcobalamin)',a:'500 µg',w:'B12 under optimal ('+v+')'}]; },
    folat: function(v){ return [{n:'Folat (5-MTHF)',a:'400 µg',w:'folat under optimal ('+v+')'}]; },
    testosteron: function(v){ return [{n:'Zink',a:'25 mg',w:'testosteron under optimal ('+v+')'},{n:'Bor',a:'6 mg',w:'frit testosteron'}]; },
    tsh: function(v){ return [{n:'Selen',a:'100 µg',w:'TSH over optimal ('+v+') · skjoldbruskkirtel-støtte'}]; }
  };
  var NOTES = {
    tsh: function(v,c){ if(c.side==='high') return 'TSH er over optimal ('+v+') — det bør din læge vurdere; vi tilføjer ikke skjoldbruskkirtel-medicin.'; return null; },
    ferritin: function(v,c){ if(c.side==='low' && v>=30) return 'Ferritin er under optimal ('+v+') men ikke lavt nok til jerntilskud — vurder kost/årsag med din læge.'; return null; }
  };

  function nf(x){ return (typeof x==='number' && x % 1 !== 0) ? String(x).replace('.', ',') : String(x); }

  return {
    keys: function(){ return ORDER.slice(); },
    // Til formularen: label, enhed, optimal-tekst pr. markør (køns-aware)
    markers: function(sex){
      return ORDER.map(function(k){ var m=M[k], z=zone(k,sex);
        var opt = (m.dir==='low') ? ('mål < '+nf(z[1])) : (k==='tsh'?('mål '+nf(z[0])+'–'+nf(z[1])):('mål > '+nf(z[0])));
        return { key:k, label:m.label, unit:m.unit, optimal:z, optimalText:opt };
      });
    },
    classify: classify,
    // values: {key:number}. Returnerer {items:[{n,a,w,cap}], notes:[], statuses:{}}
    recommend: function(values, sex){
      var items=[], notes=[], statuses={};
      ORDER.forEach(function(k){
        var v=values[k]; if(v==null || !isFinite(v)) return;
        var c=classify(k,v,sex); statuses[k]=c;
        if(NOTES[k]){ var nn=NOTES[k](v,c); if(nn) notes.push(nn); }
        if(!c || c.status==='optimal') return;
        (SUPP[k]?SUPP[k](v,c):[]).forEach(function(it){
          var ex=null; for(var i=0;i<items.length;i++){ if(items[i].n===it.n){ ex=items[i]; break; } }
          if(ex){ if(ex.w.indexOf(it.w)<0) ex.w += ' · ' + it.w; }
          else items.push({ n:it.n, a:it.a, w:it.w, cap:!!it.cap });
        });
      });
      return { items:items, notes:notes, statuses:statuses };
    }
  };
})();
