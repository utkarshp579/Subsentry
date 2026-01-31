class ConfidenceScoringService {
  constructor() {
    this.subscriptionKeywords = this.initializeSubscriptionKeywords();
    this.receiptPatterns = this.initializeReceiptPatterns();
    this.recurringPatterns = this.initializeRecurringPatterns();
    this.amountPatterns = this.initializeAmountPatterns();
  }

  initializeSubscriptionKeywords() {
    return {
      high: [
        'subscription', 'renewal', 'billing', 'invoice', 'payment',
        'charged', 'auto-renew', 'recurring', 'membership', 'premium'
      ],
      medium: [
        'monthly', 'yearly', 'annual', 'quarterly', 'weekly',
        'plan', 'tier', 'upgrade', 'downgrade'
      ],
      low: [
        'confirm', 'receipt', 'order', 'purchase', 'transaction',
        'thank you', 'welcome'
      ]
    };
  }

  initializeReceiptPatterns() {
    return [
      /\b(order #|invoice #|receipt #|transaction id)\b/i,
      /\b(amount|total|subtotal|grand total)\s*[:$]\s*\$?\d+/i,
      /\b(paid|charged|billed)\s+(?:on|for|at)\s+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/i,
      /\b(payment|billing)\s+(?:method|card|account)\b/i,
      /\b(vat|tax|gst|hst)\s*[:$]?\s*\$?\d+/i
    ];
  }

  initializeRecurringPatterns() {
    return [
      /\b(renew|renewal|recurring|auto[-\s]?renew)\b/i,
      /\b(next\s+(?:payment|billing|charge|renewal))\b/i,
      /\b(monthly|yearly|annual|quarterly|weekly)\s+(?:payment|billing|charge|subscription)\b/i,
      /\b(subscription\s+(?:will\s+)?renew|expires|ends)\b/i,
      /\b(cancel|pause|suspend)\s+(?:subscription|membership|plan)\b/i
    ];
  }

  initializeAmountPatterns() {
    return [
      /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|CAD|EUR|GBP|AUD)/g,
      /\b(amount|total|cost|price|fee)\s*[:$]\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi
    ];
  }

  normalizeText(text) {
    if (!text) return '';
    return text.toLowerCase()
      .replace(/[^\w\s@.$\-\/]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  extractAmounts(text) {
    if (!text) return [];
    const amounts = new Set();
    
    for (const pattern of this.amountPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const amount = match.replace(/[^\d.$]/g, '').replace(/,/g, '');
          const numericAmount = parseFloat(amount.replace(/[$]/g, ''));
          if (numericAmount > 0 && numericAmount < 10000) {
            amounts.add(numericAmount);
          }
        });
      }
    }
    
    return Array.from(amounts).sort((a, b) => b - a);
  }

  calculateKeywordScore(subject, sender) {
    const normalizedSubject = this.normalizeText(subject);
    const normalizedSender = this.normalizeText(sender);
    const combinedText = `${normalizedSubject} ${normalizedSender}`;
    
    let score = 0;
    const matchedKeywords = [];

    // High priority keywords
    for (const keyword of this.subscriptionKeywords.high) {
      if (combinedText.includes(keyword)) {
        score += 25;
        matchedKeywords.push({ keyword, weight: 'high' });
      }
    }

    // Medium priority keywords
    for (const keyword of this.subscriptionKeywords.medium) {
      if (combinedText.includes(keyword)) {
        score += 15;
        matchedKeywords.push({ keyword, weight: 'medium' });
      }
    }

    // Low priority keywords (but still relevant)
    for (const keyword of this.subscriptionKeywords.low) {
      if (combinedText.includes(keyword)) {
        score += 8;
        matchedKeywords.push({ keyword, weight: 'low' });
      }
    }

    // Penalize non-subscription indicators
    const negativeKeywords = ['one-time', 'single payment', 'free trial ended', 'refund', 'cancellation confirmed'];
    for (const keyword of negativeKeywords) {
      if (combinedText.includes(keyword)) {
        score -= 10;
        matchedKeywords.push({ keyword, weight: 'negative' });
      }
    }

    return {
      score: Math.max(0, Math.min(score, 40)),
      matchedKeywords,
      details: `Found ${matchedKeywords.length} keyword matches`
    };
  }

  calculateReceiptScore(subject, sender) {
    const normalizedSubject = this.normalizeText(subject);
    const normalizedSender = this.normalizeText(sender);
    const combinedText = `${normalizedSubject} ${normalizedSender}`;
    
    let score = 0;
    const matchedPatterns = [];

    for (const pattern of this.receiptPatterns) {
      if (pattern.test(combinedText)) {
        score += 20;
        matchedPatterns.push(pattern.toString());
      }
    }

    return {
      score: Math.min(score, 30),
      matchedPatterns,
      details: `Found ${matchedPatterns.length} receipt patterns`
    };
  }

  calculateRecurringScore(subject, sender) {
    const normalizedSubject = this.normalizeText(subject);
    const normalizedSender = this.normalizeText(sender);
    const combinedText = `${normalizedSubject} ${normalizedSender}`;
    
    let score = 0;
    const matchedPatterns = [];

    for (const pattern of this.recurringPatterns) {
      if (pattern.test(combinedText)) {
        score += 15;
        matchedPatterns.push(pattern.toString());
      }
    }

    return {
      score: Math.min(score, 20),
      matchedPatterns,
      details: `Found ${matchedPatterns.length} recurring patterns`
    };
  }

  calculateDomainScore(sender, vendorKey) {
    if (!sender || vendorKey === 'unknown') {
      return { score: 0, domain: sender, isOfficial: false };
    }

    const domain = sender.split('@')[1]?.toLowerCase();
    if (!domain) {
      return { score: 0, domain: sender, isOfficial: false };
    }

    // Official domain patterns
    const officialPatterns = [
      /^(no-?reply|donotreply|notifications|billing|support|info|hello|team)/,
      /\.(com|net|org|io|app|co|me|tv|music|store)$/
    ];

    let score = 10;
    let isOfficial = false;

    // Check for official sender patterns
    for (const pattern of officialPatterns) {
      if (pattern.test(sender.toLowerCase())) {
        score += 5;
        isOfficial = true;
        break;
      }
    }

    // Penalize personal email domains
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    if (personalDomains.includes(domain)) {
      score -= 5;
      isOfficial = false;
    }

    return {
      score: Math.max(0, Math.min(score, 10)),
      domain,
      isOfficial,
      details: isOfficial ? 'Official domain detected' : 'Unofficial domain'
    };
  }

  calculateAmountScore(subject, sender) {
    const normalizedSubject = this.normalizeText(subject);
    const normalizedSender = this.normalizeText(sender);
    const combinedText = `${normalizedSubject} ${normalizedSender}`;
    
    const amounts = this.extractAmounts(combinedText);
    
    if (amounts.length === 0) {
      return { score: 0, amounts: [], details: 'No amounts found' };
    }

    // Typical subscription amounts are between $1 and $100
    const typicalAmounts = amounts.filter(amount => amount >= 1 && amount <= 100);
    
    if (typicalAmounts.length > 0) {
      return {
        score: 10,
        amounts: typicalAmounts,
        details: `Found ${typicalAmounts.length} typical subscription amounts`
      };
    }

    return {
      score: 5,
      amounts,
      details: 'Found amounts but outside typical subscription range'
    };
  }

  calculateOverallConfidence(emailData, vendorResolution) {
    const { subject, sender } = emailData;
    
    const keywordScore = this.calculateKeywordScore(subject, sender);
    const receiptScore = this.calculateReceiptScore(subject, sender);
    const recurringScore = this.calculateRecurringScore(subject, sender);
    const domainScore = this.calculateDomainScore(sender, vendorResolution.vendorKey);
    const amountScore = this.calculateAmountScore(subject, sender);

    const totalScore = keywordScore.score + 
                      receiptScore.score + 
                      recurringScore.score + 
                      domainScore.score + 
                      amountScore.score;

    const confidence = Math.min(totalScore, 100);

    const signals = {
      keywords: keywordScore,
      receipt: receiptScore,
      recurring: recurringScore,
      domain: domainScore,
      amount: amountScore
    };

    // Create explainability breakdown
    const topSignals = this.getTopSignals(signals);

    return {
      confidence,
      signals,
      explainability: {
        topSignals,
        confidenceBreakdown: {
          domainMatch: domainScore.score,
          subjectKeywords: keywordScore.score,
          recurringPattern: recurringScore.score,
          receiptPattern: receiptScore.score,
          amountDetection: amountScore.score
        }
      }
    };
  }

  getTopSignals(signals) {
    const allSignals = [];

    // Add keyword signals
    signals.keywords.matchedKeywords.forEach(keyword => {
      allSignals.push({
        signal: `Keyword: ${keyword.keyword}`,
        weight: keyword.weight === 'high' ? 25 : keyword.weight === 'medium' ? 15 : 8,
        description: `Found ${keyword.weight} priority keyword in email content`
      });
    });

    // Add receipt pattern signals
    signals.receipt.matchedPatterns.forEach(pattern => {
      allSignals.push({
        signal: 'Receipt Pattern',
        weight: 20,
        description: 'Detected receipt/invoice pattern in email'
      });
    });

    // Add recurring pattern signals
    signals.recurring.matchedPatterns.forEach(pattern => {
      allSignals.push({
        signal: 'Recurring Pattern',
        weight: 15,
        description: 'Detected recurring payment/subscription language'
      });
    });

    // Add domain signal
    if (signals.domain.isOfficial) {
      allSignals.push({
        signal: 'Official Domain',
        weight: signals.domain.score,
        description: 'Email sent from official business domain'
      });
    }

    // Add amount signal
    if (signals.amount.amounts.length > 0) {
      allSignals.push({
        signal: 'Amount Detected',
        weight: signals.amount.score,
        description: `Found typical subscription amounts: $${signals.amount.amounts.join(', $')}`
      });
    }

    // Sort by weight and return top 3
    return allSignals
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);
  }
}

module.exports = new ConfidenceScoringService();
