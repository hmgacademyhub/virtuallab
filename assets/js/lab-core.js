var HMG = (function() {
  'use strict';
  var KEY = 'hmg-lab-v5';
  var store = JSON.parse(localStorage.getItem(KEY) || '{}');
  var D = {students:[],classes:[],progress:{},badges:[],forumPosts:[],parentAccounts:[]};
  Object.keys(D).forEach(function(k){if(store[k]===undefined)store[k]=D[k];});
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}}
  function getState(k){return store[k];}
  function setState(k,v){store[k]=v;persist();}
  var BADGES=[
    {id:'first',name:'First Steps',icon:'🚀'},{id:'five',name:'Lab Explorer',icon:'🔬'},
    {id:'ten',name:'Lab Scientist',icon:'🧪'},{id:'perfect',name:'Perfect Score',icon:'🏆'},
    {id:'streak3',name:'On Fire',icon:'🔥'},{id:'streak7',name:'Week Warrior',icon:'💪'},
    {id:'top3',name:'Top Performer',icon:'👑'},{id:'helpful',name:'Helper',icon:'🤝'},
    {id:'polymath',name:'Polymath',icon:'🧠'},{id:'pet',name:"Teacher's Pet",icon:'⭐'}
  ];
  function addStudent(data){
    if(!store.students.find(function(s){return s.id===data.id;})){
      store.students.push({id:data.id||'STU-'+Date.now().toString(36).toUpperCase(),name:data.name,email:data.email||'',classId:data.classId||'',points:0,level:1,badges:[],joinedAt:new Date().toISOString()});
      persist();toast('✓ '+data.name+' added','success');return true;
    }toast('⚠️ Student exists','warn');return false;
  }
  function createClass(name,teacher,subject){
    var c={id:'CLS-'+Date.now().toString(36).toUpperCase(),name:name,teacher:teacher||'Teacher',subject:subject||'General',code:Math.random().toString(36).substring(2,8).toUpperCase(),studentIds:[],createdAt:new Date().toISOString(),archived:false};
    store.classes.push(c);persist();toast('📚 Class "'+name+'" created! Code: '+c.code,'success');return c;
  }
  function getClasses(){return store.classes.filter(function(c){return !c.archived;});}
  function trackProgress(sid,sim,data){
    var key=sid+':'+sim;var e=store.progress[key]||{attempts:0,scores:[],timeSpent:0,completed:false};
    e.attempts++;if(data.score!==undefined)e.scores.push(data.score);if(data.timeSpent)e.timeSpent+=data.timeSpent;if(data.completed)e.completed=true;
    e.lastAccessed=new Date().toISOString();store.progress[key]=e;persist();return e;
  }
  function getLeaderboard(){return [...store.students].sort(function(a,b){return (b.points||0)-(a.points||0);}).slice(0,20).map(function(s,i){return {rank:i+1,...s};});}
  function awardBadge(sid,bid){
    var s=store.students.find(function(x){return x.id===sid;});if(!s||s.badges.includes(bid))return false;
    s.badges.push(bid);s.points=(s.points||0)+50;persist();
    var b=BADGES.find(function(x){return x.id===bid;});toast('🏅 Badge: '+(b?b.icon+' '+b.name:bid),'success');return true;
  }
  function getStudentBadges(sid){
    var s=store.students.find(function(x){return x.id===sid;});
    return s?s.badges.map(function(id){return BADGES.find(function(b){return b.id===id;});}).filter(Boolean):[];
  }
  var tc=null;
  function toast(msg,type,dur){
    dur=dur||4000;if(!tc){tc=document.createElement('div');tc.style.cssText='position:fixed;top:80px;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem';document.body.appendChild(tc);}
    var t=document.createElement('div');
    var color=type==='success'?'#27ae60':type==='warn'?'#f39c12':type==='error'?'#e74c3c':'#e94560';
    t.style.cssText='padding:.75rem 1.25rem;border-radius:8px;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.15);border-left:4px solid '+color+';font-size:.85rem;max-width:420px';
    t.textContent=msg;tc.appendChild(t);
    setTimeout(function(){t.style.transition='all .3s';t.style.opacity='0';t.style.transform='translateX(100%)';setTimeout(function(){t.remove();},300);},dur);
  }
  var ELEMENTS = [
    {n:1,sym:'H',name:'Hydrogen',m:1.008,cat:'nonmetal',r:1,c:1},
    {n:2,sym:'He',name:'Helium',m:4.003,cat:'noble-gas',r:1,c:18},
    {n:3,sym:'Li',name:'Lithium',m:6.941,cat:'alkali-metal',r:2,c:1},
    {n:4,sym:'Be',name:'Beryllium',m:9.012,cat:'alkaline-earth',r:2,c:2},
    {n:5,sym:'B',name:'Boron',m:10.811,cat:'metalloid',r:2,c:13},
    {n:6,sym:'C',name:'Carbon',m:12.011,cat:'nonmetal',r:2,c:14},
    {n:7,sym:'N',name:'Nitrogen',m:14.007,cat:'nonmetal',r:2,c:15},
    {n:8,sym:'O',name:'Oxygen',m:15.999,cat:'nonmetal',r:2,c:16},
    {n:9,sym:'F',name:'Fluorine',m:18.998,cat:'halogen',r:2,c:17},
    {n:10,sym:'Ne',name:'Neon',m:20.180,cat:'noble-gas',r:2,c:18},
    {n:11,sym:'Na',name:'Sodium',m:22.990,cat:'alkali-metal',r:3,c:1},
    {n:12,sym:'Mg',name:'Magnesium',m:24.305,cat:'alkaline-earth',r:3,c:2},
    {n:13,sym:'Al',name:'Aluminium',m:26.982,cat:'post-transition',r:3,c:13},
    {n:14,sym:'Si',name:'Silicon',m:28.086,cat:'metalloid',r:3,c:14},
    {n:15,sym:'P',name:'Phosphorus',m:30.974,cat:'nonmetal',r:3,c:15},
    {n:16,sym:'S',name:'Sulfur',m:32.065,cat:'nonmetal',r:3,c:16},
    {n:17,sym:'Cl',name:'Chlorine',m:35.453,cat:'halogen',r:3,c:17},
    {n:18,sym:'Ar',name:'Argon',m:39.948,cat:'noble-gas',r:3,c:18},
    {n:19,sym:'K',name:'Potassium',m:39.098,cat:'alkali-metal',r:4,c:1},
    {n:20,sym:'Ca',name:'Calcium',m:40.078,cat:'alkaline-earth',r:4,c:2},
    {n:21,sym:'Sc',name:'Scandium',m:44.956,cat:'transition',r:4,c:3},
    {n:22,sym:'Ti',name:'Titanium',m:47.867,cat:'transition',r:4,c:4},
    {n:23,sym:'V',name:'Vanadium',m:50.942,cat:'transition',r:4,c:5},
    {n:24,sym:'Cr',name:'Chromium',m:51.996,cat:'transition',r:4,c:6},
    {n:25,sym:'Mn',name:'Manganese',m:54.938,cat:'transition',r:4,c:7},
    {n:26,sym:'Fe',name:'Iron',m:55.845,cat:'transition',r:4,c:8},
    {n:27,sym:'Co',name:'Cobalt',m:58.933,cat:'transition',r:4,c:9},
    {n:28,sym:'Ni',name:'Nickel',m:58.693,cat:'transition',r:4,c:10},
    {n:29,sym:'Cu',name:'Copper',m:63.546,cat:'transition',r:4,c:11},
    {n:30,sym:'Zn',name:'Zinc',m:65.380,cat:'transition',r:4,c:12},
    {n:31,sym:'Ga',name:'Gallium',m:69.723,cat:'post-transition',r:4,c:13},
    {n:32,sym:'Ge',name:'Germanium',m:72.630,cat:'metalloid',r:4,c:14},
    {n:33,sym:'As',name:'Arsenic',m:74.922,cat:'metalloid',r:4,c:15},
    {n:34,sym:'Se',name:'Selenium',m:78.971,cat:'nonmetal',r:4,c:16},
    {n:35,sym:'Br',name:'Bromine',m:79.904,cat:'halogen',r:4,c:17},
    {n:36,sym:'Kr',name:'Krypton',m:83.798,cat:'noble-gas',r:4,c:18},
    {n:37,sym:'Rb',name:'Rubidium',m:85.468,cat:'alkali-metal',r:5,c:1},
    {n:38,sym:'Sr',name:'Strontium',m:87.620,cat:'alkaline-earth',r:5,c:2},
    {n:39,sym:'Y',name:'Yttrium',m:88.906,cat:'transition',r:5,c:3},
    {n:40,sym:'Zr',name:'Zirconium',m:91.224,cat:'transition',r:5,c:4},
    {n:41,sym:'V',name:'Vanadium',m:50.942,cat:'transition',r:4,c:5},
    {n:42,sym:'Nb',name:'Niobium',m:92.906,cat:'transition',r:5,c:5}
  ];
  for(var nn=43;nn<=118;nn++){
    var cats=['transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','lanthanide','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','post-transition','post-transition','post-transition','post-transition','halogen','noble-gas','alkali-metal','alkaline-earth','actinide','actinide','actinide','actinide','actinide','actinide','actinide','actinide','actinide','actinide','actinide','actinide','actinide','actinide','actinide','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','transition','post-transition','post-transition','post-transition','post-transition','halogen','noble-gas'];
    var names=['Technetium','Ruthenium','Rhodium','Palladium','Silver','Cadmium','Indium','Tin','Antimony','Tellurium','Iodine','Xenon','Caesium','Barium','Lanthanum','Cerium','Praseodymium','Neodymium','Promethium','Samarium','Europium','Gadolinium','Terbium','Dysprosium','Holmium','Erbium','Thulium','Ytterbium','Lutetium','Hafnium','Tantalum','Tungsten','Rhenium','Osmium','Iridium','Platinum','Gold','Mercury','Thallium','Lead','Bismuth','Polonium','Astatine','Radon','Francium','Radium','Actinium','Thorium','Protactinium','Uranium','Neptunium','Plutonium','Americium','Curium','Berkelium','Californium','Einsteinium','Fermium','Mendelevium','Nobelium','Lawrencium','Rutherfordium','Dubnium','Seaborgium','Bohrium','Hassium','Meitnerium','Darmstadtium','Roentgenium','Copernicium','Nihonium','Flerovium','Moscovium','Livermorium','Tennessine','Oganesson'];
    var syms=['Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe','Cs','Ba','La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn','Fr','Ra','Ac','Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og'];
    var masses=[98,101.07,102.906,106.42,107.868,112.414,114.818,118.71,121.76,127.6,126.904,131.293,132.905,137.327,138.905,140.116,140.908,144.243,145,150.362,151.964,157.25,158.925,162.5,164.93,167.259,168.934,173.054,174.967,178.49,180.948,183.84,186.207,190.23,192.217,195.084,196.967,200.592,204.38,207.2,208.98,209,210,222,223,226,227,232.038,231.036,238.029,237,244,243,247,247,251,252,257,258,259,262,267,268,269,270,269,278,281,282,285,286,289,290,293,294,294];
    var rows=[5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7];
    var cols=[7,8,9,10,11,12,13,14,15,16,17,18,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
    ELEMENTS.push({n:nn,sym:syms[nn-43],name:names[nn-43],m:masses[nn-43],cat:cats[nn-43],r:rows[nn-43],c:cols[nn-43]});
  }
  var CAT_NAMES={nonmetal:'Nonmetal','noble-gas':'Noble Gas','alkali-metal':'Alkali Metal','alkaline-earth':'Alkaline Earth',transition:'Transition Metal','post-transition':'Post-Transition',metalloid:'Metalloid',halogen:'Halogen',lanthanide:'Lanthanide',actinide:'Actinide'};
  var CAT_COLORS={nonmetal:'#c8e6c9','noble-gas':'#bbdefb','alkali-metal':'#ffcdd2','alkaline-earth':'#f8bbd0',transition:'#ffe0b2','post-transition':'#d7ccc8',metalloid:'#e1bee7',halogen:'#b3e5fc',lanthanide:'#f0f4c3',actinide:'#dcedc8'};
  function init(){
    var tg=document.querySelector('.nav-toggle'),mn=document.querySelector('.nav-menu');
    if(tg&&mn){tg.addEventListener('click',function(){mn.classList.toggle('open');tg.classList.toggle('open');});}
    var bt=document.querySelector('.btt');
    if(bt){window.addEventListener('scroll',function(){bt.classList.toggle('visible',window.scrollY>400);},{passive:true});
    bt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});}
    var p=window.location.pathname;
    document.querySelectorAll('.nav-menu a').forEach(function(a){var h=a.getAttribute('href');if(h&&h!=='index.html'&&p.includes(h.replace('.html','')))a.classList.add('active');else if((p.endsWith('/')||p.endsWith('index.html'))&&(h==='index.html'||h==='./'))a.classList.add('active');});
    document.querySelectorAll('[data-count]').forEach(function(el){var t=parseInt(el.dataset.count,10);if(isNaN(t))return;var s=performance.now();requestAnimationFrame(function tick(now){var p=Math.min((now-s)/2000,1);el.textContent=Math.floor((1-Math.pow(1-p,3))*t);if(p<1)requestAnimationFrame(tick);});});
    console.log('🏫 HMG Academy Virtual Lab v5 loaded');
  }
  return{getState:getState,setState:setState,persist:persist,addStudent:addStudent,createClass:createClass,getClasses:getClasses,trackProgress:trackProgress,getLeaderboard:getLeaderboard,awardBadge:awardBadge,getStudentBadges:getStudentBadges,toast:toast,init:init,BADGES:BADGES,ELEMENTS:ELEMENTS,CAT_NAMES:CAT_NAMES,CAT_COLORS:CAT_COLORS};
})();
document.addEventListener('DOMContentLoaded',HMG.init);
