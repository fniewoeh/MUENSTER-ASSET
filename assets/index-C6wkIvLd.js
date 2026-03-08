(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function n(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(s){if(s.ep)return;s.ep=!0;const a=n(s);fetch(s.href,a)}})();const an="a",sn=8e4,rn={min:0,max:3e5,step:100},on={incomeMonthsFactor:8,minEquity:2e4,maxTotalInvestmentRatio:.4},ln={rentPerSqm:19.25,ancillaryCostRate:.085,vacancyRate:0,monthlyManagementFlat:70,monthlyMaintenanceFlat:30,purchaseYear:2027,rentStartYear:2028,rentStartQuarter:4,afaStartYear:2028,afaStartQuarter:4,kfwLoanAmount:15e4,kfwInterestRate:.029,kfwRepaymentRate:.024,kfwGraceYears:3,kfwGrantAmount:15e3,bankInterestRate:.0485,bankRepaymentRate:.02,zinsbindungJahre:10,refinanceInterestRate:.03,refinanceRepaymentRate:.02,monumentShare:.72,annualGrowthRate:.02,years:20,afaSchedule:[{startYear:1,endYear:8,rate:.09},{startYear:9,endYear:12,rate:.07}]},cn=[{maxMonthlyIncome:2800,rate:.24},{maxMonthlyIncome:3800,rate:.29},{maxMonthlyIncome:5200,rate:.34},{maxMonthlyIncome:7e3,rate:.38},{maxMonthlyIncome:999999,rate:.42}],un=[{id:"a",label:"Apartment A",subtitle:"1-Zimmer, ca. 27 m2",size:27,purchasePrice:21e4,image:"/floorplans/apartment-a.png",monthlyManagement:55,monthlyMaintenance:60,monthlyOtherCost:20},{id:"b",label:"Apartment B",subtitle:"2-Zimmer, ca. 35 m2",size:35,purchasePrice:275e3,image:"/floorplans/apartment-b.png",monthlyManagement:65,monthlyMaintenance:75,monthlyOtherCost:25}],mn={defaultApartmentId:an,defaultAnnualGrossIncome:sn,incomeBounds:rn,equityModel:on,assumptions:ln,taxBrackets:cn,apartments:un},H="york-living-runtime-config",ht=de(mn),b=ea(ht),ft=Un(),Pe=b.apartments,r=b.assumptions,I=r.years,G={min:-2,max:5,step:.1},q={min:0,max:3e4,step:500},V={min:0,max:12,step:.1},dn="https://maps.app.goo.gl/t3fVRBvNyz42xWMp7",J=[{image:"/project/hero-york-living-tomorrow.png",alt:"York Living morgen",caption:"York Living morgen"},{image:"/project/hero-modern-living.png",alt:"Modern Living",caption:"Modern Living"},{image:"/project/hero-york-today.png",alt:"York Quartier heute",caption:"York Quartier heute"},{image:"/project/hero-bike-city.png",alt:"Münster, die Fahrrad-Stadt",caption:"Münster, die Fahrrad-Stadt"}],pn=u("app");pn.innerHTML=`
  <details class="config-menu">
    <summary class="config-toggle">Parameter</summary>
    <div class="config-panel">
      <div class="config-panel-header">
        <div>
          <p class="config-panel-title">Rechenparameter</p>
          <p class="config-panel-copy">
            Zins, Tilgung, Kaufpreis und Steuerannahmen direkt im UI anpassen. Änderungen gelten
            lokal in diesem Browser, bis Sie sie zurücksetzen.
          </p>
        </div>
      </div>

      <form id="config-form" class="config-form" autocomplete="off">
        <div class="config-section-list">${Hn(ft,b)}</div>
      </form>

      <div class="config-actions">
        <button id="apply-config" class="btn btn-primary btn-compact" type="button">Übernehmen</button>
        <button id="reset-config" class="btn btn-secondary btn-compact" type="button">Zurücksetzen</button>
        <button id="copy-config" class="btn btn-secondary btn-compact" type="button">Backup JSON</button>
      </div>

      <p id="config-status" class="config-status" role="status" aria-live="polite"></p>
    </div>
  </details>

  <main class="page">
    <section class="panel hero">
      <div class="hero-visual">
        <div id="hero-slideshow" class="hero-slideshow">
          <img
            id="hero-slide-image"
            src="${Ne(J[0].image)}"
            alt="${J[0].alt}"
          />
          <div class="hero-slide-overlay">
            <p id="hero-slide-caption" class="hero-slide-caption">${J[0].caption}</p>
            <div class="hero-slide-controls">
              <button
                id="hero-slide-prev"
                class="hero-slide-nav"
                type="button"
                aria-label="Vorheriges Projektbild"
              >
                ‹
              </button>
              <button
                id="hero-slide-next"
                class="hero-slide-nav"
                type="button"
                aria-label="Nächstes Projektbild"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-content">
        <p class="eyebrow">York Living Münster</p>
        <h1>Ihr Immobilien-Check in 60 Sekunden</h1>
        <p class="lead">
          Wählen Sie einen Grundriss, geben Sie Ihr Bruttojahreseinkommen ein und erhalten Sie sofort eine
          transparente ${I}-Jahres-Prognose für Ihr mögliches Vermögen.
        </p>
        <div class="hero-actions">
          <a
            class="btn btn-secondary btn-link"
            href="${dn}"
            target="_blank"
            rel="noreferrer noopener"
          >
            Lage auf Google Maps
          </a>
          <button id="copy-scenario-link" class="btn btn-primary" type="button">Szenario-Link kopieren</button>
        </div>
        <p id="share-status" class="share-status" role="status" aria-live="polite"></p>
      </div>
    </section>

    <section class="workspace">
      <section class="panel choose-panel">
        <h2>1. Wählen Sie Ihre Wohnungsoption</h2>
        <div id="apartment-options" class="apartment-options"></div>

        <div class="income-block">
          <h2>2. Ihr Bruttojahreseinkommen</h2>
          <div class="income-row">
            <label class="field field-income-compact" for="annual-gross-income">
              <span>Bruttojahreseinkommen (EUR)</span>
              <input
                id="annual-gross-income"
                type="number"
                min="${b.incomeBounds.min}"
                max="${b.incomeBounds.max}"
                step="${b.incomeBounds.step}"
                inputmode="decimal"
              />
            </label>

            <fieldset class="field field-tax-mode">
              <legend>Steuertarif</legend>
              <div class="tax-mode-switch" role="radiogroup" aria-label="Steuertarif wählen">
                <label class="tax-mode-option" for="tax-mode-grund">
                  <input id="tax-mode-grund" type="radio" name="tax-table-mode" value="grund" />
                  <span>Grundtabelle</span>
                </label>
                <label class="tax-mode-option" for="tax-mode-splitting">
                  <input id="tax-mode-splitting" type="radio" name="tax-table-mode" value="splitting" />
                  <span>Splitting</span>
                </label>
              </div>
            </fieldset>
          </div>

          <label class="field" for="growth-rate">
            <span>Gemeinsame Wertentwicklung Objektwert + Miete (pro Jahr)</span>
            <input
              id="growth-rate"
              type="range"
              min="${G.min}"
              max="${G.max}"
              step="${G.step}"
            />
            <strong id="out-growth-rate" class="slider-value">-</strong>
          </label>

          <label class="field" for="equity-amount">
            <span>Eingesetztes Eigenkapital</span>
            <input
              id="equity-amount"
              type="range"
              min="${q.min}"
              max="${q.max}"
              step="${q.step}"
            />
            <strong id="out-equity-amount" class="slider-value">-</strong>
          </label>

        </div>

        <div class="assumption-grid">
          <article>
            <p class="assumption-label">Eigenkapital für Nebenkosten</p>
            <p id="out-start-equity">-</p>
          </article>
          <article>
            <p class="assumption-label">Gesamtinvestition inkl. Nebenkosten</p>
            <p id="out-total-investment">-</p>
          </article>
          <article>
            <p id="out-tax-label" class="assumption-label">Steuer laut Grundtabelle</p>
            <p id="out-tax-rate">-</p>
          </article>
          <article>
            <p class="assumption-label">Restschuld bei Anschlussfinanzierung</p>
            <p id="out-refinance-debt">-</p>
          </article>
        </div>
      </section>

      <section class="panel result-panel" aria-live="polite">
        <p class="eyebrow">3. Prognose</p>
        <h2 id="result-headline">Ihr mögliches Vermögen nach ${I} Jahren</h2>
        <p id="out-wealth20" class="wealth-value">-</p>
        <p id="out-wealth-gain" class="wealth-subvalue">-</p>

        <div id="budget-card" class="budget-card"></div>

        <div id="comparison-card" class="comparison-card"></div>

        <div class="metric-grid">
          <article class="metric-card">
            <p class="metric-label">Objektwert in ${I} Jahren</p>
            <p id="out-object-value" class="metric-value">-</p>
          </article>
          <article class="metric-card">
            <p class="metric-label">Kumulierter Cashflow (${I} Jahre)</p>
            <p id="out-cashflow20" class="metric-value">-</p>
          </article>
        </div>

        <div class="liquidity-block">
          <div class="liquidity-head">
            <p class="assumption-label">Monatliche Liquidität über ${I} Jahre</p>
            <div class="liquidity-head-actions">
              <button
                id="liquidity-view-toggle"
                class="liquidity-view-toggle"
                type="button"
                aria-label="Zur nächsten Liquiditätsansicht wechseln"
              >
                <span id="liquidity-mode" class="liquidity-mode">Vor Steuern</span>
              </button>
            </div>
          </div>
          <div id="liquidity-view-content" class="liquidity-view-content"></div>
        </div>

        <div class="progress-wrap">
          <div class="progress-meta">
            <p>Vermögensentwicklung über ${I} Jahre</p>
            <p id="out-path-end">-</p>
          </div>
          <div class="path-legend">
            <span class="path-legend-item"><span class="path-legend-bar"></span> Immobilie</span>
            <span class="path-legend-item"><span class="path-legend-dot"></span> Vermögensdepot</span>
          </div>
          <div id="wealth-path" class="wealth-path"></div>
        </div>

        <div id="wealth-composition" class="wealth-composition"></div>

      </section>
    </section>

    <section class="panel facts-panel">
      <h2>Ein paar schnelle Fakten über Münster.</h2>
      <p class="lead">
        Diese Kennzahlen zeigen vor allem eines: Münster verbindet knappen Wohnraum, hohe Nachfrage
        nach kompakten Apartments und eine Lage mit kurzen Wegen in die
        Innenstadt.
      </p>
      <div class="facts-grid">
        <article class="fact-card">
          <p class="fact-number">30.000</p>
          <p class="fact-title">zusätzliche Wohnungen bis 2040</p>
          <div class="fact-bar">
            <div class="fact-fill fact-fill-demand" style="width: 18%"></div>
          </div>
          <p class="fact-copy">Das entspricht rund 18 % des Bestands von 2022.</p>
        </article>

        <article class="fact-card">
          <p class="fact-number">55,3 %</p>
          <p class="fact-title">Einpersonen-Haushalte (2024)</p>
          <div class="compare-row">
            <span>2011: 53,0 %</span>
            <span>2024: 55,3 %</span>
          </div>
          <div class="fact-bar">
            <div class="fact-fill fact-fill-single" style="width: 55.3%"></div>
          </div>
        </article>

        <article class="fact-card">
          <p class="fact-number">1,1 %</p>
          <p class="fact-title">Leerstand aktuell</p>
          <div class="compare-row">
            <span>Ist: 1,1 %</span>
            <span>Soll: 3,0 %</span>
          </div>
          <div class="dual-bars">
            <div class="dual-bar">
              <span style="width: 36.7%"></span>
            </div>
            <div class="dual-bar dual-bar-target">
              <span style="width: 100%"></span>
            </div>
          </div>
        </article>

        <article class="fact-card">
          <p class="fact-number">15-20 min</p>
          <p class="fact-title">Fahrzeit zur Innenstadt</p>
          <p class="fact-copy">Ca. 6,5 km bis Domplatz per Rad oder Auto laut Broschüre.</p>
          <p class="fact-copy">Ein Ort, der Investment und Lebensqualität zusammenbringt.</p>
        </article>
      </div>
    </section>
  </main>

  <div id="liquidity-modal" class="liquidity-modal" aria-hidden="true">
    <div class="liquidity-modal-backdrop" data-liquidity-modal-close="true"></div>
    <section
      class="liquidity-modal-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="liquidity-modal-title"
    >
      <header class="liquidity-modal-head">
        <div>
          <p class="eyebrow">Detailansicht</p>
          <h3 id="liquidity-modal-title">Jährliche Einnahmen und Ausgaben</h3>
        </div>
        <div class="liquidity-modal-actions">
          <button
            id="liquidity-modal-cycle"
            type="button"
            class="liquidity-inline-toggle"
            aria-label="Zur nächsten Grafikansicht wechseln"
            hidden
          >
            Zur Grafik
          </button>
          <button
            id="liquidity-modal-close"
            type="button"
            class="liquidity-view-nav"
            aria-label="Detailansicht schließen"
          >
            ×
          </button>
        </div>
      </header>
      <div id="liquidity-modal-content" class="liquidity-modal-content"></div>
    </section>
  </div>
`;const hn=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0}),fn=new Intl.NumberFormat("de-DE",{minimumFractionDigits:1,maximumFractionDigits:1}),ot=u("apartment-options"),Re=u("annual-gross-income"),gt=Array.from(document.querySelectorAll('input[name="tax-table-mode"]')),Ie=u("growth-rate"),Ae=u("equity-amount"),gn=u("share-status"),yt=u("config-form"),lt=u("config-status"),yn=u("liquidity-mode"),Ee=u("liquidity-view-toggle"),bt=u("liquidity-view-content"),bn=u("apply-config"),vn=u("reset-config"),wn=u("copy-config"),kn=u("copy-scenario-link"),pe=u("hero-slideshow"),ct=u("hero-slide-image"),Sn=u("hero-slide-caption"),Mn=u("hero-slide-prev"),xn=u("hero-slide-next"),_=u("liquidity-modal"),qn=u("liquidity-modal-content"),$n=u("liquidity-modal-close"),Le=u("liquidity-modal-cycle");let $=b.defaultApartmentId,j="grund",Y=b.defaultAnnualGrossIncome,B=r.annualGrowthRate*100,A=je($),L=6,z="afterTaxChart",Ye=0,U=null,Be=null,X=!1;Vn();vt();Mt();jn(Y);Fn(B);Nn(A);xt();he();aa()&&O("Lokale Konfigurationsänderungen sind aktiv.");C();Re.addEventListener("input",()=>{Y=S(P(Re.value,Y),b.incomeBounds.min,b.incomeBounds.max),C()});gt.forEach(e=>{e.addEventListener("change",()=>{Et(e.value)&&(j=e.value,Mt(),C())})});Ie.addEventListener("input",()=>{B=S(P(Ie.value,B),G.min,G.max),C()});Ae.addEventListener("input",()=>{A=S(P(Ae.value,A),q.min,q.max),C()});kn.addEventListener("click",async()=>{const e=Gn($,j,Y,B,A),t=await Yt(e);Wn(t?"Szenario-Link mit Wohnungswahl und Einkommen wurde kopiert.":"Szenario-Link konnte nicht automatisch kopiert werden.")});Mn.addEventListener("click",()=>{Ve(-1),qt()});xn.addEventListener("click",()=>{Ve(1),qt()});pe.addEventListener("mouseenter",Ge);pe.addEventListener("mouseleave",he);pe.addEventListener("focusin",Ge);pe.addEventListener("focusout",he);$n.addEventListener("click",()=>{Te()});Le.addEventListener("click",()=>{ze()});_.addEventListener("click",e=>{const t=e.target;!(t instanceof HTMLElement)||!t.closest('[data-liquidity-modal-close="true"]')||Te()});document.addEventListener("keydown",e=>{e.key!=="Escape"||!X||Te()});Ee.addEventListener("click",()=>{ze()});bt.addEventListener("click",e=>{const t=e.target;!(t instanceof HTMLElement)||!t.closest('[data-liquidity-cycle="true"]')||ze()});bn.addEventListener("click",()=>{try{const e=Rt(yt);ta(e),O("Konfiguration gespeichert. Seite wird neu geladen."),window.setTimeout(()=>window.location.reload(),250)}catch(e){const t=e instanceof Error?e.message:"Unbekannter Fehler";O(`Konfiguration konnte nicht gespeichert werden: ${t}`,!0)}});vn.addEventListener("click",()=>{na(),O("Lokale Konfiguration entfernt. Seite wird neu geladen."),window.setTimeout(()=>window.location.reload(),250)});wn.addEventListener("click",async()=>{try{const e=Rt(yt),t=await Yt(It(e));O(t?"Konfigurations-Backup wurde als JSON kopiert.":"Backup konnte nicht automatisch kopiert werden.",!t)}catch(e){const t=e instanceof Error?e.message:"Unbekannter Fehler";O(`Konfiguration ist noch nicht gültig: ${t}`,!0)}});function vt(){ot.innerHTML=Pe.map(e=>{const t=e.id===$?" apartment-card-active":"",n=`
        <p class="apartment-title">${e.label}</p>
        <p class="apartment-subtitle">${e.subtitle}</p>
      `;return`
        <button
          type="button"
          class="apartment-card${t}"
          data-apartment="${e.id}"
          aria-pressed="${e.id===$}"
        >
          <div class="apartment-image-wrap">
            <img src="${Ne(e.image)}" alt="Grundriss ${e.label}" />
          </div>
          <div class="apartment-info">
            ${n}
            <p class="apartment-price">${d(e.purchasePrice)}</p>
          </div>
        </button>
      `}).join(""),ot.querySelectorAll(".apartment-card").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.apartment;!t||!ee(t)||($=t,vt(),C())})})}function C(){const e=$t($),t=B/100,n=Rn(e,Y,t,A,j,L/100);Be=n,g("result-headline",`Ihr mögliches Vermögen nach ${I} Jahren mit ${e.label}`),g("out-wealth20",d(n.wealth20)),g("out-wealth-gain",`Vermögenszuwachs ggü. Startkapital: ${y(n.wealthGain20)}`),g("out-object-value",d(n.projectedValue20)),g("out-cashflow20",y(n.cumulativeCashflow20)),g("out-growth-rate",`${ia(n.annualGrowthRate*100)} % pro Jahr`),g("out-equity-amount",d(n.startEquity)),g("out-path-end",d(n.wealth20)),g("out-start-equity",d(n.startEquity)),g("out-total-investment",`${d(n.totalInvestment)} (inkl. ${d(n.ancillaryCosts)} Nebenkosten = ${te(r.ancillaryCostRate*100)} %)`),g("out-tax-rate",`${d(n.annualTax)} p.a. | Grenzsteuersatz ${te(n.marginalTaxRate*100)} %`),g("out-tax-label",`Steuer laut ${Qn(n.taxTableMode)}`),g("out-refinance-debt",d(n.refinanceDebtBase)),In(n),An(n),Yn(n),Ln(n.yearlyWealthPath,n.yearlyDepotPath),En(n),Tn()}function Rn(e,t,n,i,s,a){const l=r.refinanceInterestRate,h=r.refinanceRepaymentRate,c=e.size*r.rentPerSqm*12,f=(e.monthlyManagement+e.monthlyOtherCost)*12,w=e.monthlyMaintenance*12,F=t*.8,m=Ce(F,s),v=Dn(F,s),fe=e.purchasePrice*r.ancillaryCostRate,ge=e.purchasePrice+fe,ne=S(i,q.min,Math.min(q.max,ge)),We=Math.max(ge-ne,0),N=Math.min(We,r.kfwLoanAmount),ye=Math.max(We-N,0),Bt=N>0?Math.min(r.kfwGrantAmount,N):0,be=Math.max(N-Bt,0),ve=ye,Je=be+ve,Ct=be*(r.kfwInterestRate+r.kfwRepaymentRate),Pt=ve*(r.bankInterestRate+r.bankRepaymentRate),zt=dt(On()),Tt=Kn(),Vt=dt(Tt),Oe=r.zinsbindungJahre+1,Gt=-((N*.5*r.kfwInterestRate+ye*.5*r.bankInterestRate)/12);let K=be,D=ve,M=Je,Ke=0,De=0,Q=0,we=0,ke=0,Qe=0,ae=0,ie=0,Se=0;const Ze=[],Ue=[],He=[];let se=ne;for(let k=1;k<=r.years;k+=1){const Qt=Fe(k),R=Zn(k),et=1-R;let re=0,oe=0,le=0,ce=0,ue=0,Z=0,me=0;if(k===Oe+1&&(M=K+D,Ke=M,De=M*(l+h)),k<=Oe){const st=K*r.kfwInterestRate,Xt=k<=r.kfwGraceYears?0:Math.min(Math.max(Ct-st,0),K),rt=D*r.bankInterestRate,en=Math.min(Math.max(Pt-rt,0),D),tn=N*.5*r.kfwInterestRate*et,nn=ye*.5*r.bankInterestRate*et;oe=tn+st*R,le=Xt*R,ce=nn+rt*R,ue=en*R,re=oe+le+ce+ue,K-=le,D-=ue,M=K+D}else Z=M*l,me=Math.min(Math.max(De-Z,0),M),re=Z+me,M-=me;const xe=c*Math.pow(1+n,k-1)*R,tt=xe*r.vacancyRate,Zt=tt+f*R+w*R,qe=xe-Zt,Ut=Jn(k),Ht=e.purchasePrice*r.monumentShare*Ut,_t=oe+ce+Z,nt=-(qe-_t-Ht)*v,W=qe-re+nt;Q+=W,k<=zt?(we+=W,ae+=1):k<=Vt?(ke+=W,ie+=1):(Qe+=W,Se+=1);const at=e.purchasePrice*Math.pow(1+n,k),it=at-M+Q;Ze.push(it),se=se*(1+a)+-W,Ue.push(se),He.push({year:k,calendarYear:Qt,propertyValue:at,grossRent:xe,vacancyCost:tt,managementCost:f*R,maintenanceCost:w*R,netBeforeDebt:qe,kfwInterest:oe,kfwPrincipal:le,bankInterest:ce,bankPrincipal:ue,refinanceInterest:Z,refinancePrincipal:me,debtService:re,taxBenefit:nt,cashflow:W,cumulativeCashflow:Q,remainingDebt:M,netWealth:it})}const _e=e.purchasePrice*Math.pow(1+n,r.years),Xe=_e-M+Q,jt=Xe-ne,Ft=c/e.purchasePrice*100,Nt=c*r.vacancyRate+f+w,Wt=(c-Nt)/e.purchasePrice*100,Jt=ae>0?we/(ae*12):0,Ot=ie>0?ke/(ie*12):0,Kt=Se>0?Qe/(Se*12):0,Me=ae+ie,Dt=Me>0?(we+ke)/(Me*12):0;return{apartment:e,taxTableMode:s,annualGrossIncome:t,annualTax:m,marginalTaxRate:v,annualGrowthRate:n,startEquity:ne,totalInvestment:ge,ancillaryCosts:fe,initialDebt:Je,projectedValue20:_e,cumulativeCashflow20:Q,wealth20:Xe,wealthGain20:jt,constructionPhaseMonthlyLiquidity:Gt,afaPhaseOneMonthlyLiquidity:Jt,afaPhaseTwoMonthlyLiquidity:Ot,afaCombinedMonthlyLiquidity:Dt,postAfaMonthlyLiquidity:Kt,afaTotalYears:Me,refinanceDebtBase:Ke,grossYield:Ft,netYieldBeforeDebt:Wt,yearlyWealthPath:Ze,yearlyLiquidityRows:He,depotReturnRate:a,depotWealth20:se,yearlyDepotPath:Ue,finalRemainingDebt:M}}function In(e){const t=u("budget-card"),n=e.afaCombinedMonthlyLiquidity,i=e.postAfaMonthlyLiquidity,s=e.afaTotalYears,a=n>=0?"tone-positive":"tone-negative",l=n>=0?`Sie erhalten in den ersten ${s} Jahren einen monatlichen Ertrag und bauen gleichzeitig ein Vermögen von ${d(e.wealth20)} auf.`:`Für nur ${d(Math.abs(n))} im Monat bauen Sie ein Vermögen von ${d(e.wealth20)} auf.`;t.innerHTML=`
    <p class="budget-label">Mittlerer mtl. Aufwand nach Steuern</p>
    <span class="budget-hero ${a}">${y(n)} / Monat</span>
    <p class="budget-summary">${l}</p>
    <p class="budget-footnote">AfA Jahr 1–${s}. Ab Jahr ${s+1} ohne Denkmal-AfA: ca. ${y(i)}/Monat.</p>
  `}function An(e){const t=u("comparison-card"),n=e.wealth20>=e.depotWealth20,i=e.wealth20-e.depotWealth20;t.querySelector("#depot-return-rate-inline")||(t.innerHTML=`
      <p class="comparison-title">Immobilie vs. Vermögensdepot nach ${I} Jahren</p>
      <div class="comparison-columns">
        <div id="comp-col-property" class="comparison-col">
          <p class="comparison-label">Immobilie</p>
          <p id="comp-val-property" class="comparison-value">-</p>
        </div>
        <div class="comparison-vs">vs.</div>
        <div id="comp-col-depot" class="comparison-col">
          <p class="comparison-label">Vermögensdepot</p>
          <p id="comp-val-depot" class="comparison-value">-</p>
        </div>
      </div>
      <p id="comp-note" class="comparison-note">-</p>
      <label class="comparison-slider-label" for="depot-return-rate-inline">
        <span>Depot-Rendite: <strong id="out-depot-return-inline">-</strong></span>
        <input
          id="depot-return-rate-inline"
          class="comparison-slider"
          type="range"
          min="${V.min}"
          max="${V.max}"
          step="${V.step}"
          value="${L}"
        />
      </label>
    `,t.querySelector("#depot-return-rate-inline").addEventListener("input",c=>{const f=c.target;L=S(P(f.value,L),V.min,V.max),C()}));const a=t.querySelector("#comp-col-property"),l=t.querySelector("#comp-col-depot");a.classList.toggle("comparison-winner",n),l.classList.toggle("comparison-winner",!n),g("comp-val-property",d(e.wealth20)),g("comp-val-depot",d(e.depotWealth20)),g("out-depot-return-inline",`${te(L)} % p.a.`);const h=u("comp-note");h.className=`comparison-note ${i>=0?"tone-positive":"tone-negative"}`,h.textContent=`${i>=0?"+":""}${d(i)} ${i>=0?"Vorteil Immobilie (Hebeleffekt)":"Vorteil Vermögensdepot"}`}function En(e){const t=u("wealth-composition"),n=[{label:`Objektwert in ${I} Jahren`,value:e.projectedValue20},{label:"Kumulierter Cashflow",value:e.cumulativeCashflow20},{label:"Restschuld",value:-e.finalRemainingDebt}];t.innerHTML=`
    <p class="composition-title">Woraus besteht Ihr Vermögen?</p>
    <div class="composition-rows">
      ${n.map(i=>`
        <div class="composition-row">
          <span>${i.label}</span>
          <span class="${E(i.value)}">${y(i.value)}</span>
        </div>`).join("")}
      <div class="composition-row composition-total">
        <span>Nettovermögen</span>
        <span>${d(e.wealth20)}</span>
      </div>
    </div>
  `}function Ln(e,t){const n=u("wealth-path"),i=[...e,...t],s=Math.max(...i.map(a=>Math.abs(a)),1);n.style.setProperty("--year-count",String(e.length)),n.innerHTML=e.map((a,l)=>{const h=Math.max(Math.abs(a)/s*100,3),c=a>=0?"path-bar-positive":"path-bar-negative",f=t[l]??0,w=Math.max(Math.abs(f)/s*100,1);return`
        <div class="path-col" title="Jahr ${l+1}: Immobilie ${d(a)} | Depot ${d(f)}">
          <span class="path-bar-wrap">
            <span class="path-bar ${c}" style="height: ${h.toFixed(2)}%"></span>
            <span class="path-depot-marker" style="bottom: ${w.toFixed(2)}%"></span>
          </span>
          <span class="path-year">${l+1}</span>
        </div>
      `}).join("")}function Yn(e){yn.textContent=St(z);const t=kt(z);Ee.title=`Nächste Ansicht: ${ut(t)}`,Ee.setAttribute("aria-label",`Nächste Ansicht: ${ut(t)}`);const n=z==="afterTaxChart"?"afterTax":"beforeTax";bt.innerHTML=Bn(e,n)}function Bn(e,t){const n=e.yearlyLiquidityRows.map(c=>({calendarYear:c.calendarYear,monthlyValue:t==="afterTax"?c.cashflow/12:(c.cashflow-c.taxBenefit)/12})),i=n.map(c=>c.monthlyValue),s=Math.max(...i.map(c=>Math.abs(c)),1),a=Math.max(...i,0),l=Math.min(...i,0);return`
    <button
      class="liquidity-chart-card"
      type="button"
      data-liquidity-cycle="true"
      aria-label="Liquiditätsansicht weiterschalten"
    >
      <div class="liquidity-chart-meta">
        <div>
          <p class="liquidity-chart-title">${t==="afterTax"?"Nach Steuern":"Vor Steuern"}</p>
          <p class="liquidity-chart-copy">Klick auf das Diagramm für die nächste Ansicht</p>
        </div>
        <p class="liquidity-chart-range">${y(l)} bis ${y(a)} / Monat</p>
      </div>
      <div class="liquidity-chart" style="--year-count: ${i.length}">
        <div class="liquidity-scale">
          <span>${d(s)}</span>
          <span>0 €</span>
          <span>-${d(s).replace("-","")}</span>
        </div>
        <div class="liquidity-chart-plot">
          ${n.map(c=>{const f=c.monthlyValue===0?0:Math.max(Math.abs(c.monthlyValue)/s*46,2),w=c.monthlyValue>=0?"liquidity-bar-positive":"liquidity-bar-negative",F=String(c.calendarYear).slice(-2);return`
                <div class="liquidity-year" title="${c.calendarYear}: ${y(c.monthlyValue)} / Monat">
                  <div class="liquidity-year-plot">
                    <span class="liquidity-bar ${w}" style="--bar-size: ${f.toFixed(2)}%"></span>
                  </div>
                  <span class="liquidity-year-label">${F}</span>
                </div>
              `}).join("")}
        </div>
      </div>
    </button>
  `}function Cn(e){const t=e.yearlyLiquidityRows[0]?.calendarYear??r.purchaseYear,n=e.yearlyLiquidityRows[e.yearlyLiquidityRows.length-1]?.calendarYear??r.purchaseYear+I-1;let i=0;const s=e.yearlyLiquidityRows.map(a=>{const l=a.kfwInterest+a.bankInterest+a.refinanceInterest,h=a.kfwPrincipal+a.bankPrincipal+a.refinancePrincipal,c=a.vacancyCost+a.managementCost+a.maintenanceCost,f=a.cashflow-a.taxBenefit,w=a.cashflow;return i+=w,`
        <tr>
          <td>${a.calendarYear}</td>
          <td class="${E(a.grossRent)}">${y(a.grossRent)}</td>
          <td class="${E(-l)}">${y(-l)}</td>
          <td class="${E(-h)}">${y(-h)}</td>
          <td class="${E(-c)}">${y(-c)}</td>
          <td class="${E(a.taxBenefit)}">${y(a.taxBenefit)}</td>
          <td class="${E(f)}">${y(f)}</td>
          <td class="${E(w)}">${y(w)}</td>
          <td class="${E(i)}">${y(i)}</td>
        </tr>
      `}).join("");return`
    <div class="liquidity-table-card liquidity-table-card-modal">
      <div class="liquidity-table-head">
        <div>
          <p class="liquidity-chart-title">Jährliche Liquiditätsdetails</p>
          <p class="liquidity-chart-copy">${t} bis ${n} mit allen Jahreswerten.</p>
        </div>
      </div>
      <div class="liquidity-table-scroll liquidity-table-scroll-modal">
        <table class="liquidity-detail-table" aria-label="Jährliche Einnahmen Ausgaben Details">
          <thead>
            <tr>
              <th>Jahr</th>
              <th>Miete</th>
              <th>Zins</th>
              <th>Tilgung</th>
              <th>Nebenkosten</th>
              <th>Steuer</th>
              <th>Liqui v. St.</th>
              <th>Liqui n. St.</th>
              <th>Kumuliert</th>
            </tr>
          </thead>
          <tbody>${s}</tbody>
        </table>
      </div>
    </div>
  `}function Pn(e){qn.innerHTML=Cn(e),Le.textContent=St("table"),Le.setAttribute("aria-label","Zur nächsten Liquiditätsansicht wechseln"),!X&&(_.classList.add("liquidity-modal-open"),_.setAttribute("aria-hidden","false"),document.body.classList.add("body-modal-open"),X=!0)}function wt(){X&&(_.classList.remove("liquidity-modal-open"),_.setAttribute("aria-hidden","true"),document.body.classList.remove("body-modal-open"),X=!1)}function zn(){z=kt(z)}function ze(){if(zn(),C(),z!=="table"){wt();return}Be&&Pn(Be)}function Te(){wt(),z==="table"&&(z="afterTaxChart",C())}function kt(e){return e==="afterTaxChart"?"beforeTaxChart":e==="beforeTaxChart"?"table":"afterTaxChart"}function ut(e){return e==="afterTaxChart"?"Nach Steuern":e==="beforeTaxChart"?"Vor Steuern":"Tabelle"}function St(e){return e==="afterTaxChart"?"Vor Steuern":e==="beforeTaxChart"?"Tabelle":"Nach Steuern"}function Tn(){const e=new URLSearchParams;$!==b.defaultApartmentId&&e.set("apartment",$),j!=="grund"&&e.set("tax",j),Y!==b.defaultAnnualGrossIncome&&e.set("gross",String(Math.round(Y))),B!==r.annualGrowthRate*100&&e.set("growth",String(B)),A!==je($)&&e.set("equity",String(Math.round(A))),L!==6&&e.set("depot",String(L));const t=e.toString(),n=t?`${window.location.pathname}?${t}`:window.location.pathname;window.history.replaceState(null,"",n)}function Vn(){const e=new URLSearchParams(window.location.search),t=e.get("apartment");t&&ee(t)&&Pe.some(h=>h.id===t)&&($=t);const n=e.get("tax");n&&Et(n)&&(j=n),A=je($);const i=e.get("gross")??e.get("income");i&&(Y=S(P(i,Y),b.incomeBounds.min,b.incomeBounds.max));const s=e.get("growth");s&&(B=S(P(s,B),G.min,G.max));const a=e.get("equity");a&&(A=S(P(a,A),q.min,q.max));const l=e.get("depot");l&&(L=S(P(l,L),V.min,V.max))}function Gn(e,t,n,i,s){const a=new URLSearchParams;return a.set("apartment",e),a.set("tax",t),a.set("gross",String(Math.round(n))),a.set("growth",String(i)),a.set("equity",String(Math.round(s))),`${window.location.origin}${window.location.pathname}?${a.toString()}`}function g(e,t){u(e).textContent=t}function jn(e){Re.value=String(Math.round(e))}function Fn(e){Ie.value=String(e)}function Nn(e){Ae.value=String(Math.round(e))}function Wn(e){gn.textContent=e}function Mt(){gt.forEach(e=>{e.checked=e.value===j})}function xt(){const e=J[Ye];ct.src=Ne(e.image),ct.alt=e.alt,Sn.textContent=e.caption}function Ve(e){const t=J.length;t!==0&&(Ye=(Ye+e+t)%t,xt())}function he(){U!==null||J.length<2||(U=window.setInterval(()=>{Ve(1)},6e3))}function Ge(){U!==null&&(window.clearInterval(U),U=null)}function qt(){Ge(),he()}function $t(e){const t=Pe.find(n=>n.id===e);if(!t)throw new Error(`Apartment "${e}" not found.`);return t}function Jn(e){const t=Fe(e);if(t<r.afaStartYear)return 0;const n=t-r.afaStartYear+1,i=r.afaSchedule.find(a=>n>=a.startYear&&n<=a.endYear);if(!i)return 0;const s=t===r.afaStartYear?(5-r.afaStartQuarter)/4:1;return i.rate*s}function On(){const t=[...r.afaSchedule].sort((n,i)=>n.startYear-i.startYear)[0];return t?t.endYear:8}function Kn(){return r.afaSchedule.reduce((e,t)=>Math.max(e,t.endYear),0)}function mt(e){const t=Math.max(e,0);if(t<=11604)return 0;if(t<=17005){const n=(t-11604)/1e4;return(922.98*n+1400)*n}if(t<=66760){const n=(t-17005)/1e4;return(181.19*n+2397)*n+1025.38}return t<=277825?.42*t-10602.13:.45*t-18936.88}function Ce(e,t){const n=Math.max(e,0);return t==="splitting"?2*mt(n/2):mt(n)}function Dn(e,t){const n=Math.max(e,0),i=1,s=Ce(n,t),a=Ce(n+i,t);return Math.max((a-s)/i,0)}function Qn(e){return e==="splitting"?"Splittingtabelle":"Grundtabelle"}function je(e){const n=$t(e).purchasePrice*r.ancillaryCostRate;return S(n,q.min,q.max)}function Fe(e){return r.purchaseYear+e-1}function dt(e){return r.afaStartYear-r.purchaseYear+e}function Zn(e){const t=Fe(e);return t<r.rentStartYear?0:t>r.rentStartYear?1:(5-r.rentStartQuarter)/4}function Un(){return[{title:"Finanzierung",copy:"KfW, Bankdarlehen und Tilgungslogik.",open:!0,fields:[{type:"number",id:"config-kfw-loan-amount",label:"KfW-Darlehen",hint:"Förderdarlehen für das Objekt.",mode:"currency",min:0,step:500,get:e=>e.assumptions.kfwLoanAmount,set:(e,t)=>{e.assumptions.kfwLoanAmount=t}},{type:"number",id:"config-kfw-interest-rate",label:"KfW-Zins",hint:"Nominalzins für den KfW-Anteil.",mode:"percent",min:0,max:15,step:.05,get:e=>e.assumptions.kfwInterestRate,set:(e,t)=>{e.assumptions.kfwInterestRate=t}},{type:"number",id:"config-kfw-repayment-rate",label:"KfW-Tilgung",hint:"Reguläre Tilgung nach der Karenz.",mode:"percent",min:0,max:15,step:.05,get:e=>e.assumptions.kfwRepaymentRate,set:(e,t)=>{e.assumptions.kfwRepaymentRate=t}},{type:"number",id:"config-kfw-grace-years",label:"Karenzjahre",hint:"Jahre mit nur Zinszahlung im KfW-Teil.",mode:"number",min:0,max:10,step:1,get:e=>e.assumptions.kfwGraceYears,set:(e,t)=>{e.assumptions.kfwGraceYears=t}},{type:"number",id:"config-kfw-grant-amount",label:"KfW-Zuschuss",hint:"Tilgungszuschuss aus dem Programm.",mode:"currency",min:0,step:500,get:e=>e.assumptions.kfwGrantAmount,set:(e,t)=>{e.assumptions.kfwGrantAmount=t}},{type:"number",id:"config-bank-interest-rate",label:"Bankzins",hint:"Nominalzins für den Bankanteil.",mode:"percent",min:0,max:15,step:.05,get:e=>e.assumptions.bankInterestRate,set:(e,t)=>{e.assumptions.bankInterestRate=t}},{type:"number",id:"config-bank-repayment-rate",label:"Banktilgung",hint:"Jährliche Tilgung für das Bankdarlehen.",mode:"percent",min:0,max:15,step:.05,get:e=>e.assumptions.bankRepaymentRate,set:(e,t)=>{e.assumptions.bankRepaymentRate=t}},{type:"number",id:"config-zinsbindung-jahre",label:"Zinsbindung (Jahre)",hint:"Dauer der Zinsbindung ab Kaufjahr.",mode:"number",min:5,max:20,step:1,get:e=>e.assumptions.zinsbindungJahre,set:(e,t)=>{e.assumptions.zinsbindungJahre=t}},{type:"number",id:"config-refinance-interest-rate",label:"Anschlusszins",hint:"Zinssatz nach Auslauf der Zinsbindung.",mode:"percent",min:0,max:15,step:.05,get:e=>e.assumptions.refinanceInterestRate,set:(e,t)=>{e.assumptions.refinanceInterestRate=t}},{type:"number",id:"config-refinance-repayment-rate",label:"Anschlusstilgung",hint:"Tilgungssatz nach Auslauf der Zinsbindung.",mode:"percent",min:0,max:15,step:.05,get:e=>e.assumptions.refinanceRepaymentRate,set:(e,t)=>{e.assumptions.refinanceRepaymentRate=t}}]},{title:"Markt & Entwicklung",copy:"Mietniveau, Wachstum und laufende Kosten.",open:!0,fields:[{type:"number",id:"config-rent-per-sqm",label:"Miete pro m²",hint:"Monatliche Nettokaltmiete je Quadratmeter.",mode:"currency",min:0,max:100,step:.05,get:e=>e.assumptions.rentPerSqm,set:(e,t)=>{e.assumptions.rentPerSqm=t}},{type:"number",id:"config-annual-growth-rate",label:"Wertentwicklung",hint:"Gemeinsame Entwicklung von Miete und Objektwert pro Jahr.",mode:"percent",min:-10,max:15,step:.1,get:e=>e.assumptions.annualGrowthRate,set:(e,t)=>{e.assumptions.annualGrowthRate=t}},{type:"number",id:"config-purchase-year",label:"Kaufjahr",hint:"Startjahr der Rechnung und des Investments.",mode:"number",min:2020,max:2040,step:1,get:e=>e.assumptions.purchaseYear,set:(e,t)=>{e.assumptions.purchaseYear=t}},{type:"number",id:"config-rent-start-year",label:"Mietstart Jahr",hint:"Erstes Kalenderjahr mit Vermietung.",mode:"number",min:2020,max:2045,step:1,get:e=>e.assumptions.rentStartYear,set:(e,t)=>{e.assumptions.rentStartYear=t}},{type:"number",id:"config-rent-start-quarter",label:"Mietstart Quartal",hint:"Quartal des Vermietungsstarts innerhalb des Startjahres.",mode:"number",min:1,max:4,step:1,get:e=>e.assumptions.rentStartQuarter,set:(e,t)=>{e.assumptions.rentStartQuarter=t}},{type:"number",id:"config-monument-share",label:"Denkmalanteil",hint:"Abschreibungsfähiger Anteil am Kaufpreis.",mode:"percent",min:0,max:100,step:1,get:e=>e.assumptions.monumentShare,set:(e,t)=>{e.assumptions.monumentShare=t}},{type:"number",id:"config-ancillary-cost-rate",label:"Nebenkostenquote",hint:"Zusatzkosten auf den Kaufpreis.",mode:"percent",min:0,max:25,step:.1,get:e=>e.assumptions.ancillaryCostRate,set:(e,t)=>{e.assumptions.ancillaryCostRate=t}},{type:"number",id:"config-vacancy-rate",label:"Leerstandsquote",hint:"Sicherheitsabschlag für entgangene Miete.",mode:"percent",min:0,max:20,step:.1,get:e=>e.assumptions.vacancyRate,set:(e,t)=>{e.assumptions.vacancyRate=t}}]},{title:"Wohnung A",copy:"1-Zimmer-Apartment aus der Broschüre.",open:!1,fields:[{type:"number",id:"config-apartment-a-size",label:"Größe",hint:"Wohnfläche in m².",mode:"number",min:10,max:120,step:1,get:e=>p(e,"a").size,set:(e,t)=>{p(e,"a").size=t}},{type:"number",id:"config-apartment-a-purchase-price",label:"Kaufpreis",hint:"Investitionssumme vor Nebenkosten.",mode:"currency",min:0,step:1e3,get:e=>p(e,"a").purchasePrice,set:(e,t)=>{p(e,"a").purchasePrice=t}},{type:"number",id:"config-apartment-a-management",label:"Verwaltung",hint:"Wohnungsspezifische Kosten pro Monat.",mode:"currency",min:0,step:5,get:e=>p(e,"a").monthlyManagement,set:(e,t)=>{p(e,"a").monthlyManagement=t}},{type:"number",id:"config-apartment-a-maintenance",label:"Rücklage",hint:"Wohnungsspezifische Instandhaltung pro Monat.",mode:"currency",min:0,step:5,get:e=>p(e,"a").monthlyMaintenance,set:(e,t)=>{p(e,"a").monthlyMaintenance=t}},{type:"number",id:"config-apartment-a-other-cost",label:"Weitere Kosten",hint:"Sonstige Monatskosten für Wohnung A.",mode:"currency",min:0,step:5,get:e=>p(e,"a").monthlyOtherCost,set:(e,t)=>{p(e,"a").monthlyOtherCost=t}}]},{title:"Wohnung B",copy:"2-Zimmer-Apartment aus der Broschüre.",open:!1,fields:[{type:"number",id:"config-apartment-b-size",label:"Größe",hint:"Wohnfläche in m².",mode:"number",min:10,max:120,step:1,get:e=>p(e,"b").size,set:(e,t)=>{p(e,"b").size=t}},{type:"number",id:"config-apartment-b-purchase-price",label:"Kaufpreis",hint:"Investitionssumme vor Nebenkosten.",mode:"currency",min:0,step:1e3,get:e=>p(e,"b").purchasePrice,set:(e,t)=>{p(e,"b").purchasePrice=t}},{type:"number",id:"config-apartment-b-management",label:"Verwaltung",hint:"Wohnungsspezifische Kosten pro Monat.",mode:"currency",min:0,step:5,get:e=>p(e,"b").monthlyManagement,set:(e,t)=>{p(e,"b").monthlyManagement=t}},{type:"number",id:"config-apartment-b-maintenance",label:"Rücklage",hint:"Wohnungsspezifische Instandhaltung pro Monat.",mode:"currency",min:0,step:5,get:e=>p(e,"b").monthlyMaintenance,set:(e,t)=>{p(e,"b").monthlyMaintenance=t}},{type:"number",id:"config-apartment-b-other-cost",label:"Weitere Kosten",hint:"Sonstige Monatskosten für Wohnung B.",mode:"currency",min:0,step:5,get:e=>p(e,"b").monthlyOtherCost,set:(e,t)=>{p(e,"b").monthlyOtherCost=t}}]},{title:"AfA & Projektion",copy:"Abschreibungsparameter und Projektionslaufzeit.",open:!1,fields:[{type:"number",id:"config-projection-years",label:"Projektionsjahre",hint:"Laufzeit der Vermögensprojektion.",mode:"number",min:1,max:40,step:1,get:e=>e.assumptions.years,set:(e,t)=>{e.assumptions.years=t}},{type:"number",id:"config-afa-start-year",label:"AfA Start Jahr",hint:"Jahr des Abschlusses der begünstigten Baumaßnahme.",mode:"number",min:2020,max:2045,step:1,get:e=>e.assumptions.afaStartYear,set:(e,t)=>{e.assumptions.afaStartYear=t}},{type:"number",id:"config-afa-start-quarter",label:"AfA Start Quartal",hint:"Quartal, ab dem die Denkmal-AfA erstmals anläuft.",mode:"number",min:1,max:4,step:1,get:e=>e.assumptions.afaStartQuarter,set:(e,t)=>{e.assumptions.afaStartQuarter=t}},{type:"number",id:"config-afa-rate-1",label:"AfA Satz Phase 1",hint:"Abschreibung in den ersten Jahren.",mode:"percent",min:0,max:20,step:.1,get:e=>x(e,0).rate,set:(e,t)=>{const n=x(e,0);e.assumptions.afaSchedule[0]={...n,rate:t}}},{type:"number",id:"config-afa-end-year-1",label:"AfA Ende Phase 1",hint:"Letztes Jahr der ersten Abschreibungsphase.",mode:"number",min:1,max:30,step:1,get:e=>x(e,0).endYear,set:(e,t)=>{const n=x(e,0);e.assumptions.afaSchedule[0]={...n,endYear:t}}},{type:"number",id:"config-afa-rate-2",label:"AfA Satz Phase 2",hint:"Abschreibung in der zweiten Phase.",mode:"percent",min:0,max:20,step:.1,get:e=>x(e,1).rate,set:(e,t)=>{const n=x(e,1);e.assumptions.afaSchedule[1]={...n,rate:t}}},{type:"number",id:"config-afa-end-year-2",label:"AfA Ende Phase 2",hint:"Letztes Jahr der zweiten Abschreibungsphase.",mode:"number",min:1,max:40,step:1,get:e=>x(e,1).endYear,set:(e,t)=>{const n=x(e,1);e.assumptions.afaSchedule[1]={...n,endYear:t}}}]},{title:"Standards & Grenzen",copy:"Vorgaben für den Rechner und die UI-Schieberegler.",open:!1,fields:[{type:"select",id:"config-default-apartment",label:"Startwohnung",hint:"Welche Wohnung zuerst ausgewählt sein soll.",options:e=>e.apartments.map(t=>({value:t.id,label:t.label})),get:e=>e.defaultApartmentId,set:(e,t)=>{if(!ee(t))throw new Error("Startwohnung ist ungültig.");e.defaultApartmentId=t}},{type:"number",id:"config-default-income",label:"Standard-Einkommen",hint:"Ausgangswert beim ersten Laden der Seite.",mode:"currency",min:0,step:1e3,get:e=>e.defaultAnnualGrossIncome,set:(e,t)=>{e.defaultAnnualGrossIncome=t}},{type:"number",id:"config-income-min",label:"Einkommen Minimum",hint:"Untergrenze für das Eingabefeld.",mode:"currency",min:0,step:100,get:e=>e.incomeBounds.min,set:(e,t)=>{e.incomeBounds.min=t}},{type:"number",id:"config-income-max",label:"Einkommen Maximum",hint:"Obergrenze für das Eingabefeld.",mode:"currency",min:1e3,step:100,get:e=>e.incomeBounds.max,set:(e,t)=>{e.incomeBounds.max=t}},{type:"number",id:"config-income-step",label:"Einkommen Schritt",hint:"Schrittweite im Eingabefeld.",mode:"currency",min:1,step:1,get:e=>e.incomeBounds.step,set:(e,t)=>{e.incomeBounds.step=t}},{type:"number",id:"config-income-months-factor",label:"EK-Monatsfaktor",hint:"Ableitung des Standard-Eigenkapitals aus dem Einkommen.",mode:"number",min:0,max:24,step:.5,get:e=>e.equityModel.incomeMonthsFactor,set:(e,t)=>{e.equityModel.incomeMonthsFactor=t}},{type:"number",id:"config-min-equity",label:"Mindest-Eigenkapital",hint:"Untergrenze für das Eigenkapital im Rechner.",mode:"currency",min:0,step:500,get:e=>e.equityModel.minEquity,set:(e,t)=>{e.equityModel.minEquity=t}},{type:"number",id:"config-max-investment-ratio",label:"Max. Investitionsquote",hint:"Deckel für das eingesetzte Eigenkapital relativ zum Investment.",mode:"percent",min:0,max:100,step:1,get:e=>e.equityModel.maxTotalInvestmentRatio,set:(e,t)=>{e.equityModel.maxTotalInvestmentRatio=t}}]}]}function Hn(e,t){return e.map(n=>`
        <details class="config-group"${n.open?" open":""}>
          <summary class="config-group-toggle">
            <span>${n.title}</span>
            <small>${n.copy}</small>
          </summary>
          <div class="config-grid">
            ${n.fields.map(s=>_n(s,t)).join("")}
          </div>
        </details>
      `).join("")}function _n(e,t){if(e.type==="select")return`
      <label class="config-field" for="${e.id}">
        <span class="config-field-label">${e.label}</span>
        <span class="config-field-hint">${e.hint}</span>
        <span class="config-input-wrap">
          <select id="${e.id}" class="config-select">
            ${e.options(t).map(s=>{const a=s.value===e.get(t)?" selected":"";return`<option value="${s.value}"${a}>${s.label}</option>`}).join("")}
          </select>
        </span>
      </label>
    `;const n=e.min!==void 0?` min="${e.min}"`:"",i=e.max!==void 0?` max="${e.max}"`:"";return`
    <label class="config-field" for="${e.id}">
      <span class="config-field-label">${e.label}</span>
      <span class="config-field-hint">${e.hint}</span>
      <span class="config-input-wrap">
        <input
          id="${e.id}"
          class="config-input"
          type="number"
          step="${e.step}"
          inputmode="decimal"
          value="${sa(e.get(t),e.mode)}"${n}${i}
        />
        <span class="config-input-unit">${ra(e.mode)}</span>
      </span>
    </label>
  `}function Rt(e){const t=de(b);for(const n of ft)for(const i of n.fields){if(i.type==="select"){const l=Lt(e,i.id);i.set(t,l.value);continue}const s=oa(e,i.id),a=i.mode==="percent"?s/100:s;i.set(t,a)}return Xn(t),At(t)}function Xn(e){const t=p(e,"a"),n=p(e,"b");t.subtitle=pt("a",t.size),n.subtitle=pt("b",n.size);const i=Math.max(e.incomeBounds.min,e.incomeBounds.max);e.incomeBounds.max=i,e.incomeBounds.min=Math.min(e.incomeBounds.min,i),e.incomeBounds.step=Math.max(1,e.incomeBounds.step),e.assumptions.purchaseYear=Math.round(e.assumptions.purchaseYear),e.assumptions.rentStartYear=Math.max(e.assumptions.purchaseYear,Math.round(e.assumptions.rentStartYear)),e.assumptions.rentStartQuarter=S(Math.round(e.assumptions.rentStartQuarter),1,4),e.assumptions.afaStartYear=Math.max(e.assumptions.purchaseYear,Math.round(e.assumptions.afaStartYear)),e.assumptions.afaStartQuarter=S(Math.round(e.assumptions.afaStartQuarter),1,4);const s=x(e,0),a=x(e,1);e.assumptions.afaSchedule[0]={...s,startYear:1,endYear:Math.max(1,Math.round(s.endYear))},e.assumptions.afaSchedule[1]={...a,startYear:e.assumptions.afaSchedule[0].endYear+1,endYear:Math.max(e.assumptions.afaSchedule[0].endYear+1,Math.round(a.endYear))},e.taxBrackets=e.taxBrackets.map(l=>({maxMonthlyIncome:Math.max(0,l.maxMonthlyIncome),rate:Math.max(0,l.rate)})).sort((l,h)=>l.maxMonthlyIncome-h.maxMonthlyIncome)}function It(e){return JSON.stringify(e,null,2)}function ea(e){try{const t=window.localStorage.getItem(H);return t?At(JSON.parse(t)):de(e)}catch{return window.localStorage.removeItem(H),de(e)}}function ta(e){window.localStorage.setItem(H,It(e))}function na(){window.localStorage.removeItem(H)}function aa(){return window.localStorage.getItem(H)!==null}function At(e){if(!T(e))throw new Error("Root muss ein JSON-Objekt sein.");const t=String(e.defaultApartmentId),n=e.defaultAnnualGrossIncome,i=e.incomeBounds,s=e.equityModel,a=e.assumptions,l=e.apartments,h=e.taxBrackets;if(!ee(t))throw new Error('defaultApartmentId muss "a" oder "b" sein.');const c=t;if(typeof n!="number")throw new Error("defaultAnnualGrossIncome muss eine Zahl sein.");if(!T(i))throw new Error("incomeBounds fehlt oder ist ungültig.");if(!T(s))throw new Error("equityModel fehlt oder ist ungültig.");if(!T(a))throw new Error("assumptions fehlt oder ist ungültig.");if(!Array.isArray(l)||l.length===0)throw new Error("apartments muss ein nicht-leeres Array sein.");if(!Array.isArray(h))throw new Error("taxBrackets muss ein Array sein.");const f=l.map(m=>{if(!T(m))throw new Error("Jedes apartment muss ein Objekt sein.");const v=String(m.id);if(!ee(v))throw new Error('Jedes apartment braucht eine gültige id ("a" oder "b").');return{id:v,label:$e(m.label,"apartment.label"),subtitle:$e(m.subtitle,"apartment.subtitle"),size:o(m.size,"apartment.size"),purchasePrice:o(m.purchasePrice,"apartment.purchasePrice"),image:$e(m.image,"apartment.image"),monthlyManagement:o(m.monthlyManagement,"apartment.monthlyManagement"),monthlyMaintenance:o(m.monthlyMaintenance,"apartment.monthlyMaintenance"),monthlyOtherCost:o(m.monthlyOtherCost,"apartment.monthlyOtherCost")}});if(!f.some(m=>m.id===c))throw new Error("defaultApartmentId muss in apartments enthalten sein.");const w={rentPerSqm:o(a.rentPerSqm,"assumptions.rentPerSqm"),ancillaryCostRate:o(a.ancillaryCostRate,"assumptions.ancillaryCostRate"),vacancyRate:o(a.vacancyRate,"assumptions.vacancyRate"),monthlyManagementFlat:o(a.monthlyManagementFlat,"assumptions.monthlyManagementFlat"),monthlyMaintenanceFlat:o(a.monthlyMaintenanceFlat,"assumptions.monthlyMaintenanceFlat"),purchaseYear:o(a.purchaseYear,"assumptions.purchaseYear"),rentStartYear:o(a.rentStartYear,"assumptions.rentStartYear"),rentStartQuarter:o(a.rentStartQuarter,"assumptions.rentStartQuarter"),afaStartYear:o(a.afaStartYear,"assumptions.afaStartYear"),afaStartQuarter:o(a.afaStartQuarter,"assumptions.afaStartQuarter"),kfwLoanAmount:o(a.kfwLoanAmount,"assumptions.kfwLoanAmount"),kfwInterestRate:o(a.kfwInterestRate,"assumptions.kfwInterestRate"),kfwRepaymentRate:o(a.kfwRepaymentRate,"assumptions.kfwRepaymentRate"),kfwGraceYears:o(a.kfwGraceYears,"assumptions.kfwGraceYears"),kfwGrantAmount:o(a.kfwGrantAmount,"assumptions.kfwGrantAmount"),bankInterestRate:o(a.bankInterestRate,"assumptions.bankInterestRate"),bankRepaymentRate:o(a.bankRepaymentRate,"assumptions.bankRepaymentRate"),zinsbindungJahre:o(a.zinsbindungJahre,"assumptions.zinsbindungJahre"),refinanceInterestRate:o(a.refinanceInterestRate,"assumptions.refinanceInterestRate"),refinanceRepaymentRate:o(a.refinanceRepaymentRate,"assumptions.refinanceRepaymentRate"),monumentShare:o(a.monumentShare,"assumptions.monumentShare"),annualGrowthRate:o(a.annualGrowthRate,"assumptions.annualGrowthRate"),years:o(a.years,"assumptions.years"),afaSchedule:Array.isArray(a.afaSchedule)?a.afaSchedule.map((m,v)=>{if(!T(m))throw new Error(`assumptions.afaSchedule[${v}] ist ungültig.`);return{startYear:o(m.startYear,`assumptions.afaSchedule[${v}].startYear`),endYear:o(m.endYear,`assumptions.afaSchedule[${v}].endYear`),rate:o(m.rate,`assumptions.afaSchedule[${v}].rate`)}}):(()=>{throw new Error("assumptions.afaSchedule muss ein Array sein.")})()},F=h.map((m,v)=>{if(!T(m))throw new Error(`taxBrackets[${v}] ist ungültig.`);return{maxMonthlyIncome:o(m.maxMonthlyIncome,`taxBrackets[${v}].maxMonthlyIncome`),rate:o(m.rate,`taxBrackets[${v}].rate`)}});return{defaultApartmentId:c,defaultAnnualGrossIncome:n,incomeBounds:{min:o(i.min,"incomeBounds.min"),max:o(i.max,"incomeBounds.max"),step:o(i.step,"incomeBounds.step")},equityModel:{incomeMonthsFactor:o(s.incomeMonthsFactor,"equityModel.incomeMonthsFactor"),minEquity:o(s.minEquity,"equityModel.minEquity"),maxTotalInvestmentRatio:o(s.maxTotalInvestmentRatio,"equityModel.maxTotalInvestmentRatio")},assumptions:w,taxBrackets:F,apartments:f}}function de(e){return JSON.parse(JSON.stringify(e))}function P(e,t){const n=Number.parseFloat(e.replace(",","."));return Number.isFinite(n)?n:t}function S(e,t,n){return Math.min(Math.max(e,t),n)}function ee(e){return e==="a"||e==="b"}function Et(e){return e==="grund"||e==="splitting"}function d(e){return hn.format(e)}function y(e){return e>0?`+${d(e)}`:d(e)}function ia(e){return e>0?`+${te(e)}`:te(e)}function te(e){return fn.format(e)}function E(e){return e>0?"tone-positive":e<0?"tone-negative":""}function sa(e,t){const n=t==="percent"?e*100:e;return String(Number(n.toFixed(4)))}function ra(e){return e==="percent"?"%":e==="currency"?"EUR":""}function oa(e,t){const n=Lt(e,t);return la(n.value,t)}function la(e,t){const n=e.replace(",",".").trim();if(!n.length)throw new Error(`"${t}" darf nicht leer sein.`);const i=Number.parseFloat(n);if(!Number.isFinite(i))throw new Error(`"${t}" ist keine gültige Zahl.`);return i}function Lt(e,t){const n=e.querySelector(`#${t}`);if(!n)throw new Error(`Feld "${t}" wurde nicht gefunden.`);return n}function p(e,t){const n=e.apartments.find(i=>i.id===t);if(!n)throw new Error(`Konfigurationsdaten für Wohnung "${t}" fehlen.`);return n}function x(e,t){return e.assumptions.afaSchedule[t]??ht.assumptions.afaSchedule[t]??{startYear:t===0?1:x(e,t-1).endYear+1,endYear:t===0?8:12,rate:0}}function pt(e,t){return`${e==="a"?"1-Zimmer":"2-Zimmer"}, ca. ${Math.round(t)} m²`}function O(e,t=!1){lt.textContent=e,lt.classList.toggle("config-status-error",t)}function o(e,t){if(typeof e!="number"||Number.isNaN(e))throw new Error(`${t} muss eine Zahl sein.`);return e}function $e(e,t){if(typeof e!="string"||e.length===0)throw new Error(`${t} muss ein String sein.`);return e}function T(e){return typeof e=="object"&&e!==null}async function Yt(e){if(!navigator.clipboard?.writeText)return!1;try{return await navigator.clipboard.writeText(e),!0}catch{return!1}}function u(e){const t=document.getElementById(e);if(!t)throw new Error(`Missing element "${e}".`);return t}function Ne(e){if(/^https?:\/\//.test(e))return e;const t="./",n=t.endsWith("/")?t:`${t}/`,i=e.startsWith("/")?e.slice(1):e;return`${n}${i}`}
