/* JEE Life Time AI Notes & Visual Study Material Engine
   Safe client-side prompt builder. No secret/API key is stored in the repository.
   Connect your server-side AI endpoint later via window.JEE_AI_ENDPOINT. */
(function(){
  const VISUAL_RULES=`Create actual educational visuals whenever they improve understanding. Never use image placeholders. For each required visual specify title, what it teaches, subject, topic, visual type, objects, labels, equations/symbols, arrows, axes, important points and style. Use clean textbook style, high readability and scientific accuracy.`;
  const MASTER_TEMPLATE=`You are the AI Notes & Visual Study Material Engine for an advanced IPE + EAMCET + JEE preparation platform.

INPUT:
TOPIC = {{TOPIC}}
SUBJECT = {{SUBJECT}}
CLASS = {{CLASS}}
BOARD = {{BOARD}}
EXAM PRIORITY = {{EXAM_PRIORITY}}
OUTPUT = {{OUTPUT_FORMAT}}

Generate a COMPLETE, EXAM-READY, VISUALLY ILLUSTRATED study chapter for AP/TS Intermediate / IPE, AP/TS EAMCET, JEE Main and JEE Advanced.

CRITICAL VISUAL REQUIREMENT:
This is a visual study-notes generator. For every major concept ask whether a visual would improve understanding. If yes, generate an actual illustration when the platform supports image generation; otherwise return a precise renderable visual specification. Never write '[Insert diagram here]' or leave a placeholder.

VISUAL TYPES:
Physics: free-body diagrams, ray diagrams, circuit diagrams, vector/motion diagrams, fields, waves, apparatus, thermodynamic diagrams, rotation and projectile figures, graphs.
Chemistry: molecular/Lewis structures, orbitals, hybridization, geometry, mechanisms, reaction maps, trends, energy profiles, electrochemical cells, apparatus, crystals, coordination compounds and flowcharts.
Mathematics: coordinate figures, graphs, geometry, circles, vectors, complex plane, probability trees, sequences, 3D geometry, conics, calculus graphs and sign charts.
IPE: labelled board diagrams, experiments, derivation visuals and important graphs.
EAMCET/JEE: fast concept diagrams, graph reasoning, question figures and comparison charts.

Every visual specification must contain: clear title, correct labels, symbols, arrows, axes where applicable, units where applicable, important points, a short explanation and exam relevance.

PAGE DESIGN:
TITLE -> CONCEPT EXPLANATION -> ILLUSTRATION/GRAPH -> KEY FORMULA -> EXAM TIP -> EXAMPLE. Put each visual immediately beside/below the concept it teaches.

CHAPTER STRUCTURE:
1 Cover page with topic, subject, IPE, EAMCET, JEE Main, JEE Advanced and a topic-specific cover visual.
2 Visual topic map from Foundation -> Core Concepts -> Results -> Applications -> IPE -> EAMCET -> JEE Main -> JEE Advanced -> Practice -> Revision.
3 Prerequisites.
4 Foundation from zero.
5 Complete theory covering major and minor subtopics.
6 Important derivations with principle -> equation -> transformation -> result and diagrams where useful.
7 Correct labelled graphs.
8 Formula sheet with formula, meaning, units, conditions, use case and common trap.
9 Comparison tables for commonly confused concepts.
10 Exam-specific sections for IPE, EAMCET, JEE Main and JEE Advanced.
11 Solved examples with figures whenever meaningful.
12 Practice: Foundation, IPE, EAMCET, JEE Main, JEE Advanced.
13 Answer key with concise explanations.
14 Common mistakes as warning cards.
15 Visual memory map.
16 One-page revision.
17 15-minute rapid revision.
18 Final mastery checklist: Concepts, Formulas, Derivations, Diagrams, Graphs, IPE, EAMCET, JEE Main, JEE Advanced, Practice, Revision.

QUALITY CONTROL: verify concept coverage, formula conditions, derivations, visuals, labels, graphs, chemistry structures/reactions, physics relationships, mathematical graphs, no placeholders, readable pages, and all four exam pathways.

If OUTPUT is PDF, return content structured for A4 pages with embedded visual assets/specifications, readable typography, page numbers, contents, formula cards, graphs, concept maps, whitespace and no clipping. If OUTPUT is IMAGES, return a sequence of high-resolution page specifications and actual visual assets where supported.

${VISUAL_RULES}`;

  function fillPrompt(values){
    let p=MASTER_TEMPLATE;
    Object.entries(values).forEach(([k,v])=>p=p.replaceAll('{{'+k.toUpperCase()+'}}',v||''));
    return p+'\n\nFINAL COMMAND:\nGenerate the complete illustrated study material for:\nTOPIC = '+(values.topic||'')+'\nSUBJECT = '+(values.subject||'')+'\nCLASS = '+(values.className||'11')+'\nBOARD = '+(values.board||'AP/TS Intermediate')+'\nEXAM PRIORITY = '+(values.priority||'JEE Advanced')+'\nOUTPUT = '+(values.output||'WEB');
  }

  window.JEEAI={MASTER_TEMPLATE,fillPrompt};

  function safeText(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function localExplain(topic,subject,level){
    const focus=level==='JEE Advanced'?'multi-concept reasoning, edge cases and deeper derivations':level==='JEE Main'?'core concepts, standard applications and speed':level==='IPE'?'definitions, derivations, labelled diagrams and board-style presentation':level==='EAPCET'?'fast application, formulas and objective-question patterns':'foundations, intuition and prerequisites';
    return `<div class="ai-chapter"><div class="ai-badge">AI STUDY ENGINE • ${safeText(level)}</div><h3>${safeText(topic)}</h3><p><b>Subject:</b> ${safeText(subject)} &nbsp; <b>Focus:</b> ${safeText(focus)}</p><div class="ai-grid"><div><h4>1. Core idea</h4><p>Build the concept from first principles, identify the quantities involved, and connect the definition to its mathematical/scientific meaning.</p></div><div><h4>2. Visual to generate</h4><p><b>${safeText(subject)} diagram/graph:</b> create a clean labelled textbook visual for ${safeText(topic)}. Show axes, units, symbols, arrows and important points where applicable.</p></div><div><h4>3. Formula & conditions</h4><p>List the governing formulae, define every symbol, state units and clearly note the conditions under which each result is valid.</p></div><div><h4>4. Exam lens</h4><p>IPE: presentation and derivation. EAPCET: speed and direct application. JEE Main: accuracy and standard variations. JEE Advanced: deeper reasoning and linked concepts.</p></div></div><h4>5. Active recall</h4><p>Close your notes and explain the concept, draw its key visual from memory, write the governing equation, then solve one unfamiliar problem.</p><div class="ai-note">For full chapter generation, connect a server-side AI endpoint. The complete master prompt is built into this module; no API key is exposed in the browser.</div></div>`;
  }

  document.addEventListener('DOMContentLoaded',()=>{
    const btn=document.querySelector('#explainBtn');
    if(!btn)return;
    btn.addEventListener('click',async()=>{
      const topic=document.querySelector('#explainTopic')?.value.trim();
      const subject=document.querySelector('#explainSubject')?.value||'Physics';
      const level=document.querySelector('#explainLevel')?.value||'JEE Main';
      const out=document.querySelector('#explainResult');
      if(!topic){out.innerHTML='<div class="muted">Enter a topic first.</div>';return;}
      out.innerHTML='<div class="muted">Building your visual-first explanation…</div>';
      const prompt=fillPrompt({topic,subject,className:'11',board:'AP/TS Intermediate',priority:level,output:'WEB'});
      if(window.JEE_AI_ENDPOINT){
        try{
          const r=await fetch(window.JEE_AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,topic,subject,level})});
          if(!r.ok)throw new Error('AI endpoint error');
          const data=await r.json();
          out.innerHTML=data.html||`<pre class="ai-response">${safeText(data.text||JSON.stringify(data,null,2))}</pre>`;
          return;
        }catch(e){console.warn(e);}
      }
      out.innerHTML=localExplain(topic,subject,level);
    });
  });
})();
