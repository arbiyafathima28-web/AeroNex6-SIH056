export type Language = 'en' | 'hi';

export const TRANSLATIONS = {
  en: {
    appTitle: 'AeroNex6',
    appSubtitle: 'Real-Time Airfare Intelligence & CPI Analytics for India',
    sihTag: 'MoSPI · Real-Time Airfare Intelligence Platform',
    demoMode: 'DEMO MODE',
    demoNotice: 'Prototype airfare observations are used for demonstration. Live data integration requires authorized data access and compliant connectors.',
    cpiDisclaimer: 'This is a prototype index methodology for demonstration and is not an official MoSPI CPI calculation.',
    syntheticBacktestNotice: 'SYNTHETIC BACKTEST DATA (45-Day Observation Window)',
    operational: 'Operational',
    systemStatus: 'System Status',
    lastUpdated: 'Last Updated',
    simulateCollection: 'Simulate New Collection',
    simulatingTitle: 'Executing Automated Airfare Pipeline',
    
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      network: 'Airfare Network',
      routeAnalytics: 'Route Analytics',
      airfareIndex: 'Airfare Index',
      dataQuality: 'Data Quality',
      cpiImpact: 'CPI Impact',
      more: 'More',
      dataExplorer: 'Data Explorer',
      methodology: 'Methodology & Sources',
      systemHealth: 'System Health',
    },

    // Tabs
    tabs: {
      overview: 'Overview',
      fareTrend: 'Fare Trend',
      leadTime: 'Lead Time',
      airlines: 'Airlines',
      historicalTrend: 'Historical Trend',
      routeContribution: 'Route Contribution',
    },

    // KPIs & Metrics
    kpi: {
      airfareIndex: 'Airfare Index',
      airfareIndexTooltip: 'Shows how current airfare levels have changed compared with the selected base period (Base = 100).',
      change24h: '24h Change',
      change7d: '7d Change',
      change30d: '30d Change',
      routes: 'Active Routes',
      fareRecords: 'Fare Records',
      fareRecordsTooltip: 'Total standardized fare observations captured across domestic sectors.',
      dataQuality: 'Data Quality',
      dataQualityTooltip: 'Shows how complete and valid the collected fare records are according to statistical rules.',
      averageFare: 'Average Fare',
      baseFare: 'Base Fare',
      taxesFees: 'Taxes & Fees',
      totalFare: 'Total Fare',
      routeIndex: 'Route Index',
      routeWeight: 'Basket Weight',
      contribution: 'Contribution',
    },

    // Dashboard
    dashboard: {
      headline: 'What is happening with airfares in India right now?',
      subheadline: 'Automated airfare monitoring across 42 domestic routes, feeding continuous relative price indicators for Consumer Price Index augmentation.',
      indexTrend: 'Airfare Index Trend',
      topRising: 'Top Rising Routes',
      topFalling: 'Top Falling Routes',
      leadTimeBehavior: 'Lead-Time Fare Behaviour',
      daysBeforeTravel: 'Days Before Travel',
      viewAllRoutes: 'Explore Network Map',
      viewAnalytics: 'Deep Dive Route Analytics',
      range7d: '7D',
      range30d: '30D',
      range90d: '90D',
      range45d: '45D',
    },

    // Network
    network: {
      title: 'Airfare Network & Geographic Coverage',
      description: 'Geospatial visualization of 42 domestic trunk and regional routes across 13 major airport hubs in India.',
      mapMetric: 'Map Display Metric',
      metrics: {
        index: 'Airfare Index',
        movement: 'Fare Movement (24h)',
        activity: 'Route Activity (Volume)',
        coverage: 'Data Coverage Quality',
      },
      filters: {
        allAirlines: 'All Airlines',
        allOrigins: 'All Origins',
        allDestinations: 'All Destinations',
        selectAirport: 'Click an airport or route on the map to inspect live parameters.',
      },
      panel: {
        airportDetails: 'Airport Intelligence',
        routeDetails: 'Route Intelligence',
        connectedRoutes: 'Connected Sectors',
        hubTier: 'Hub Classification',
        avgDepartureFare: 'Average Outbound Fare',
        closePanel: 'Close',
        selectRouteToView: 'Select Route',
      },
    },

    // Route Analytics
    routeAnalytics: {
      title: 'Route Analytics',
      description: 'Granular fare dynamics, lead-time curves, and airline pricing distribution for individual domestic sectors.',
      origin: 'Origin',
      destination: 'Destination',
      airline: 'Airline',
      leadTimeWindow: 'Days Before Travel',
      allLeadTimes: 'All Windows (T+1 to T+45)',
      trendType: 'Fare Component',
      totalFareLabel: 'Total Fare (incl. taxes)',
      baseFareLabel: 'Base Fare Only',
      leadTimeExplainer: 'Airfares typically spike exponentially as departure nears (T+1), while early bookings (T+30, T+45) stabilize near carrier marginal cost.',
      airlineComparison: 'Carrier Fare Distribution & Index',
      marketShare: 'Observation Share',
    },

    // Airfare Index
    airfareIndexPage: {
      title: 'Airfare Price Index (API-IND)',
      description: 'Prototype Laspeyres-type chained relative price index measuring domestic civil aviation price movements.',
      methodologyNote: 'Calculated using route-level geometric mean relative price ratios weighted by DGCA quarterly passenger volume shares.',
      historicalLabel: 'Historical 45-Day Backtest Trend',
      anomalyFlag: 'Price Spike Anomaly',
      routeContributionExplainer: 'Shows each domestic route basket weight and its net contribution in index basis points.',
    },

    // Data Quality
    dataQualityPage: {
      title: 'Data Quality & Validation Pipeline',
      description: 'Continuous validation, deduplication, and anomaly scrubbing pipeline ensuring statistical fidelity for CPI augmentation.',
      scoreTitle: 'Overall Data Quality Score',
      pipelineHeader: 'Automated Processing Pipeline Stages',
      stages: {
        raw: 'Raw Observations',
        valid: 'Validated Records',
        duplicates: 'Duplicates Removed',
        unusual: 'Unusual Fares Flagged',
        standardized: 'Standardized Fares',
        indexed: 'Index Ready Basket',
      },
      metrics: {
        completeness: 'Completeness',
        validity: 'Schema Validity',
        freshness: 'Freshness (Latency < 2h)',
        duplicateRate: 'Duplicate Rate',
        unusualFareRate: 'Unusual Fare Rate',
      },
      sourcesHeader: 'Connector & Source Ingestion Status',
      sourceTypes: {
        authorized: 'Authorized Airline APIs',
        reference: 'Government Reference (DGCA)',
        demo: 'Demo Data Adapter',
        planned: 'Authorized OTA Connectors',
      },
      timelineTitle: 'Recent Processing Runs',
    },

    // CPI Impact
    cpiImpactPage: {
      title: 'CPI Impact & Scenario Simulation',
      description: 'Interactive policy simulation model projecting the impact of airfare shifts on the Transport Sub-Index and General All India CPI.',
      currentLevel: 'Current Airfare Index',
      scenarioLabel: 'Airfare Price Shock Scenario',
      simulationResults: 'Simulation Model Outputs',
      airfareIndexSimulated: 'Simulated Airfare Index',
      transportImpact: 'Transport Group Impact (pp)',
      cpiImpact: 'All India CPI Impact (pp)',
      generalCpiBaseline: 'Baseline CPI (Reference)',
      generalCpiSimulated: 'Projected All India CPI',
      transportBasketWeight: 'Air Transport Basket Weight',
      modelAssumptions: 'Model Assumptions & Methodology',
      assumptionsText: 'Air passenger transport accounts for approximately 0.28% of the All-India CPI basket (Sub-group: Transport and Communication). An airfare shift is propagated through fixed expenditure shares to quantify headline inflation sensitivity.',
    },

    // Data Explorer
    explorer: {
      title: 'Data Explorer',
      description: 'Search, filter, and export the standardized fare observations dataset.',
      searchPlaceholder: 'Search by route, airline, or flight ID...',
      downloadCsv: 'Download CSV',
      exportFiltered: 'Export Filtered Data',
      showingRows: 'Showing {start} - {end} of {total} records',
      noRecords: 'No records found matching current filter criteria.',
      columns: {
        date: 'Date',
        route: 'Route',
        airline: 'Airline',
        advance: 'Days Before Travel',
        baseFare: 'Base Fare (₹)',
        taxes: 'Taxes (₹)',
        fees: 'Fees (₹)',
        totalFare: 'Total Fare (₹)',
        source: 'Source',
        status: 'Quality Status',
      },
    },

    // Methodology & Sources
    methodologyPage: {
      title: 'Methodology & Data Architecture',
      description: 'Formal technical documentation of data collection protocols, cleaning rules, index formulation, and compliance guidelines for MoSPI.',
      sections: {
        howItWorks: 'How AeroNex6 Works',
        dataCollection: 'Ethical Data Collection Framework',
        dataCleaning: 'Data Cleaning & Validation Rules',
        standardization: 'Fare Standardization & Component Breakdown',
        routeBasket: 'Domestic Route Basket Selection',
        routeWeighting: 'Passenger Traffic Weighting (DGCA)',
        indexFormula: 'Index Calculation Formula',
        validation: 'Statistical Validation & Anomaly Scrubbing',
        futureIntegration: 'Future Production Architecture',
      },
      sourcesInventory: 'Data Sources Inventory',
      complianceNotice: 'All data connectors adhere to automated collection guidelines. AeroNex6 explicitly prohibits anti-bot circumvention or unauthorized scraping.',
    },

    // System Health
    systemHealthPage: {
      title: 'System Health & Pipeline Telemetry',
      description: 'Real-time operational status, ingestion throughput, engine latency, and verification invariants.',
      modules: {
        collection: 'Data Collection Ingestion',
        processing: 'Processing & Cleaning Engine',
        database: 'Timescale / Datastore',
        indexEngine: 'Statistical Index Engine',
        api: 'MoSPI Open API Layer',
        dashboard: 'Analytics Dashboard UI',
      },
      telemetry: {
        lastRun: 'Last Processing Run',
        duration: 'Batch Duration',
        records: 'Processed In Last Batch',
        errorRate: 'Validation Error Rate',
        uptime: 'Engine Uptime',
      },
    },

    // Common
    common: {
      currency: '₹',
      all: 'All',
      apply: 'Apply Filters',
      reset: 'Reset Filters',
      loading: 'Processing airfare dataset...',
      page: 'Page',
      of: 'of',
      next: 'Next',
      prev: 'Previous',
      close: 'Close',
    },
  },

  hi: {
    appTitle: 'AeroNex6',
    appSubtitle: 'भारत के लिए वास्तविक समय हवाई किराया विश्लेषण और CPI सूचकांक',
    sihTag: 'MoSPI · वास्तविक समय हवाई किराया विश्लेषण मंच',
    demoMode: 'डेमो मोड',
    demoNotice: 'प्रोटोटाइप हवाई किराया डेटा केवल प्रदर्शन के लिए है। लाइव डेटा एकीकरण के लिए अधिकृत डेटा एक्सेस और अनुपालन कनेक्टर की आवश्यकता है।',
    cpiDisclaimer: 'यह केवल प्रदर्शन के लिए एक प्रोटोटाइप सूचकांक कार्यप्रणाली है और आधिकारिक MoSPI CPI गणना नहीं है।',
    syntheticBacktestNotice: 'सिंथेटिक बैकटेस्ट डेटा (45-दिवसीय अवलोकन अवधि)',
    operational: 'सक्रिय (Operational)',
    systemStatus: 'सिस्टम स्थिति',
    lastUpdated: 'अंतिम अपडेट',
    simulateCollection: 'नया डेटा संकलन प्रारंभ करें',
    simulatingTitle: 'स्वचालित हवाई किराया पाइपलाइन निष्पादन',

    // Navigation
    nav: {
      dashboard: 'डैशबोर्ड',
      network: 'एयरफेयर नेटवर्क',
      routeAnalytics: 'रूट एनालिटिक्स',
      airfareIndex: 'हवाई किराया सूचकांक',
      dataQuality: 'डेटा गुणवत्ता',
      cpiImpact: 'CPI प्रभाव',
      more: 'अन्य विकल्प',
      dataExplorer: 'डेटा एक्सप्लोरर',
      methodology: 'पद्धति और स्रोत',
      systemHealth: 'सिस्टम स्वास्थ्य',
    },

    // Tabs
    tabs: {
      overview: 'अवलोकन',
      fareTrend: 'किराया रुझान',
      leadTime: 'लीड टाइम (यात्रा पूर्व दिन)',
      airlines: 'विमान सेवा प्रदाता',
      historicalTrend: 'ऐतिहासिक रुझान',
      routeContribution: 'रूट योगदान',
    },

    // KPIs & Metrics
    kpi: {
      airfareIndex: 'हवाई किराया सूचकांक',
      airfareIndexTooltip: 'यह दर्शाता है कि आधार अवधि (आधार = 100) की तुलना में वर्तमान हवाई किराया स्तर कैसे बदला है।',
      change24h: '24 घंटे का बदलाव',
      change7d: '7 दिन का बदलाव',
      change30d: '30 दिन का बदलाव',
      routes: 'सक्रिय मार्ग',
      fareRecords: 'किराया रिकॉर्ड',
      fareRecordsTooltip: 'घरेलू क्षेत्रों में दर्ज किए गए कुल मानकीकृत किराया अवलोकन।',
      dataQuality: 'डेटा गुणवत्ता',
      dataQualityTooltip: 'यह दर्शाता है कि सांख्यिकीय नियमों के अनुसार एकत्रित किराया रिकॉर्ड कितने पूर्ण और वैध हैं।',
      averageFare: 'औसत किराया',
      baseFare: 'मूल किराया',
      taxesFees: 'कर एवं शुल्क',
      totalFare: 'कुल किराया',
      routeIndex: 'रूट सूचकांक',
      routeWeight: 'बास्केट भार (Weight)',
      contribution: 'योगदान',
    },

    // Dashboard
    dashboard: {
      headline: 'वर्तमान में भारत में हवाई किराए में क्या बदलाव हो रहे हैं?',
      subheadline: '42 घरेलू मार्गों पर स्वचालित किराया निगरानी, जो उपभोक्ता मूल्य सूचकांक (CPI) संवर्धन हेतु निरंतर मूल्य संकेतक प्रदान करती है।',
      indexTrend: 'हवाई किराया सूचकांक रुझान',
      topRising: 'सर्वाधिक वृद्धि वाले रूट',
      topFalling: 'सर्वाधिक गिरावट वाले रूट',
      leadTimeBehavior: 'यात्रा पूर्व दिनों के आधार पर किराया व्यवहार',
      daysBeforeTravel: 'यात्रा से पूर्व दिन',
      viewAllRoutes: 'नेटवर्क मैप देखें',
      viewAnalytics: 'रूट एनालिटिक्स देखें',
      range7d: '7 दिन',
      range30d: '30 दिन',
      range90d: '90 दिन',
      range45d: '45 दिन',
    },

    // Network
    network: {
      title: 'एयरफेयर नेटवर्क और भौगोलिक कवरेज',
      description: 'भारत के 13 प्रमुख हवाई अड्डों के बीच 42 घरेलू ट्रंक और क्षेत्रीय मार्गों का वास्तविक भू-स्थानिक मानचित्र।',
      mapMetric: 'मानचित्र प्रदर्शन मीट्रिक',
      metrics: {
        index: 'हवाई किराया सूचकांक',
        movement: 'किराया बदलाव (24 घंटे)',
        activity: 'रूट गतिविधि (मात्रा)',
        coverage: 'डेटा कवरेज गुणवत्ता',
      },
      filters: {
        allAirlines: 'सभी एयरलाइंस',
        allOrigins: 'सभी प्रस्थान स्थल',
        allDestinations: 'सभी गंतव्य स्थल',
        selectAirport: 'लाइव पैरामीटर देखने के लिए मानचित्र पर किसी हवाई अड्डे या मार्ग पर क्लिक करें।',
      },
      panel: {
        airportDetails: 'हवाई अड्डा विवरण',
        routeDetails: 'मार्ग विवरण',
        connectedRoutes: 'संबद्ध हवाई मार्ग',
        hubTier: 'हवाई अड्डा श्रेणी',
        avgDepartureFare: 'औसत प्रस्थान किराया',
        closePanel: 'बंद करें',
        selectRouteToView: 'रूट चुनें',
      },
    },

    // Route Analytics
    routeAnalytics: {
      title: 'रूट एनालिटिक्स',
      description: 'व्यक्तिगत घरेलू मार्गों के लिए विस्तृत किराया गतिशीलता, अग्रिम बुकिंग वक्र और एयरलाइन मूल्य निर्धारण।',
      origin: 'प्रस्थान स्थल',
      destination: 'गंतव्य स्थल',
      airline: 'एयरलाइन',
      leadTimeWindow: 'यात्रा से पूर्व दिन',
      allLeadTimes: 'सभी अग्रिम खिड़कियां (T+1 से T+45)',
      trendType: 'किराया घटक',
      totalFareLabel: 'कुल किराया (करों सहित)',
      baseFareLabel: 'केवल मूल किराया',
      leadTimeExplainer: 'प्रस्थान तिथि के निकट (T+1) हवाई किराए तेजी से बढ़ते हैं, जबकि बहुत पहले (T+30, T+45) बुकिंग स्थिर रहती है।',
      airlineComparison: 'एयरलाइन किराया तुलना एवं सूचकांक',
      marketShare: 'डेटा अवलोकन हिस्सेदारी',
    },

    // Airfare Index
    airfareIndexPage: {
      title: 'हवाई किराया सूचकांक (API-IND)',
      description: 'घरेलू नागरिक उड्डयन मूल्य परिवर्तनों को मापने वाला प्रोटोटाइप लेस्पियर्स-आधारित सापेक्ष मूल्य सूचकांक।',
      methodologyNote: 'DGCA त्रैमासिक यात्री संख्या हिस्सेदारी द्वारा भारित मार्ग-स्तरीय ज्यामितीय माध्य सापेक्ष मूल्य अनुपातों द्वारा परिकलित।',
      historicalLabel: 'ऐतिहासिक 45-दिवसीय बैकटेस्ट रुझान',
      anomalyFlag: 'असामान्य मूल्य वृद्धि',
      routeContributionExplainer: 'प्रत्येक घरेलू मार्ग का बास्केट भार और समग्र सूचकांक बदलाव में उसका शुद्ध योगदान दर्शाता है।',
    },

    // Data Quality
    dataQualityPage: {
      title: 'डेटा गुणवत्ता और सत्यापन पाइपलाइन',
      description: 'CPI संवर्धन के लिए सांख्यिकीय विश्वसनीयता सुनिश्चित करने वाली निरंतर सत्यापन, डुप्लीकेट निष्कासन और विसंगति निवारण पाइपलाइन।',
      scoreTitle: 'समग्र डेटा गुणवत्ता स्कोर',
      pipelineHeader: 'स्वचालित प्रसंस्करण पाइपलाइन चरण',
      stages: {
        raw: 'कच्चे अवलोकन (Raw Records)',
        valid: 'सत्यापित रिकॉर्ड्स',
        duplicates: 'हटाए गए डुप्लिकेट्स',
        unusual: 'चिह्नित असामान्य किराए',
        standardized: 'मानकीकृत रिकॉर्ड्स',
        indexed: 'सूचकांक तैयार बास्केट',
      },
      metrics: {
        completeness: 'डेटा पूर्णता',
        validity: 'प्रारूप वैधता',
        freshness: 'ताजगी (विलंबता < 2 घंटे)',
        duplicateRate: 'डुप्लीकेट दर',
        unusualFareRate: 'असामान्य किराया दर',
      },
      sourcesHeader: 'डेटा कनेक्टर एवं अंतर्ग्रहण स्थिति',
      sourceTypes: {
        authorized: 'अधिकृत एयरलाइन API',
        reference: 'सरकारी संदर्भ (DGCA)',
        demo: 'डेमो डेटा एडेप्टर',
        planned: 'नियोजित अधिकृत OTA कनेक्टर्स',
      },
      timelineTitle: 'हाल के प्रसंस्करण रन',
    },

    // CPI Impact
    cpiImpactPage: {
      title: 'CPI प्रभाव और परिदृश्य सिमुलेशन',
      description: 'परिवहन उप-सूचकांक और अखिल भारतीय CPI पर हवाई किराए में बदलाव के प्रभाव का अनुमान लगाने वाला मॉडल।',
      currentLevel: 'वर्तमान हवाई किराया सूचकांक',
      scenarioLabel: 'हवाई किराया मूल्य झटका परिदृश्य',
      simulationResults: 'सिमुलेशन मॉडल परिणाम',
      airfareIndexSimulated: 'सिम्युलेटेड हवाई किराया सूचकांक',
      transportImpact: 'परिवहन समूह प्रभाव (प्रतिशत बिंदु)',
      cpiImpact: 'अखिल भारतीय CPI प्रभाव (प्रतिशत बिंदु)',
      generalCpiBaseline: 'आधारभूत CPI (संदर्भ)',
      generalCpiSimulated: 'अनुमानित अखिल भारतीय CPI',
      transportBasketWeight: 'हवाई परिवहन बास्केट भार',
      modelAssumptions: 'मॉडल की धारणाएं एवं कार्यप्रणाली',
      assumptionsText: 'अखिल भारतीय CPI बास्केट में हवाई यात्री परिवहन का भार लगभग 0.28% है (उप-समूह: परिवहन और संचार)। समग्र मुद्रास्फीति संवेदनशीलता का आकलन करने के लिए एक स्थिर व्यय अनुपात लागू किया जाता है।',
    },

    // Data Explorer
    explorer: {
      title: 'डेटा एक्सप्लोरर',
      description: 'मानकीकृत किराया अवलोकन डेटाबेस खोजें, फ़िल्टर करें और निर्यात करें।',
      searchPlaceholder: 'रूट, एयरलाइन, या आईडी द्वारा खोजें...',
      downloadCsv: 'CSV डाउनलोड करें',
      exportFiltered: 'फ़िल्टर किया डेटा निर्यात करें',
      showingRows: '{total} में से {start} - {end} रिकॉर्ड प्रदर्शित',
      noRecords: 'वर्तमान फ़िल्टर मानदंडों से मेल खाने वाला कोई रिकॉर्ड नहीं मिला।',
      columns: {
        date: 'दिनांक',
        route: 'रूट',
        airline: 'एयरलाइन',
        advance: 'यात्रा से पूर्व दिन',
        baseFare: 'मूल किराया (₹)',
        taxes: 'कर (₹)',
        fees: 'शुल्क (₹)',
        totalFare: 'कुल किराया (₹)',
        source: 'स्रोत',
        status: 'गुणवत्ता स्थिति',
      },
    },

    // Methodology & Sources
    methodologyPage: {
      title: 'पद्धति और डेटा वास्तुकला',
      description: 'MoSPI के लिए डेटा संग्रह प्रोटोकॉल, सफाई नियम, सूचकांक निर्माण और अनुपालन दिशानिर्देशों का तकनीकी दस्तावेज।',
      sections: {
        howItWorks: 'AeroNex6 कैसे काम करता है',
        dataCollection: 'नैतिक डेटा संग्रह ढांचा',
        dataCleaning: 'डेटा सफाई और सत्यापन नियम',
        standardization: 'किराया मानकीकरण और घटक विभाजन',
        routeBasket: 'घरेलू रूट बास्केट चयन',
        routeWeighting: 'यात्री यातायात भारण (DGCA)',
        indexFormula: 'सूचकांक गणना सूत्र',
        validation: 'सांख्यिकीय सत्यापन और विसंगति निवारण',
        futureIntegration: 'भावी उत्पादन वास्तुकला',
      },
      sourcesInventory: 'डेटा स्रोत सूची',
      complianceNotice: 'सभी डेटा कनेक्टर स्वचालित संग्रह दिशानिर्देशों का पालन करते हैं। AeroNex6 अनधिकृत स्क्रैपिंग का स्पष्ट निषेध करता है।',
    },

    // System Health
    systemHealthPage: {
      title: 'सिस्टम स्वास्थ्य एवं टेलीमेट्री',
      description: 'वास्तविक समय परिचालन स्थिति, अंतर्ग्रहण थ्रूपुट, इंजन विलंबता और सत्यापन स्थिति।',
      modules: {
        collection: 'डेटा संग्रह अंतर्ग्रहण',
        processing: 'प्रसंस्करण और सफाई इंजन',
        database: 'टाइमस्केल / डेटास्टोर',
        indexEngine: 'सांख्यिकीय सूचकांक इंजन',
        api: 'MoSPI ओपन API लेयर',
        dashboard: 'एनालिटिक्स डैशबोर्ड UI',
      },
      telemetry: {
        lastRun: 'अंतिम प्रसंस्करण रन',
        duration: 'बैच अवधि',
        records: 'अंतिम बैच में संसाधित',
        errorRate: 'सत्यापन त्रुटि दर',
        uptime: 'इंजन अपटाइम',
      },
    },

    // Common
    common: {
      currency: '₹',
      all: 'सभी',
      apply: 'फ़िल्टर लागू करें',
      reset: 'फ़िल्टर रीसेट करें',
      loading: 'डेटासेट संसाधित हो रहा है...',
      page: 'पृष्ठ',
      of: 'का',
      next: 'अगला',
      prev: 'पिछला',
      close: 'बंद करें',
    },
  },
};
