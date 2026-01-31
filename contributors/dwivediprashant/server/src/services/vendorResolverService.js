const crypto = require('crypto');

class VendorResolverService {
  constructor() {
    this.vendorMappings = this.initializeVendorMappings();
    this.vendorIcons = this.initializeVendorIcons();
  }

  initializeVendorMappings() {
    return {
      // Streaming Services
      netflix: {
        keys: ['netflix', 'netflix.com'],
        domains: ['netflix.com', 'email.netflix.com'],
        keywords: ['netflix', 'subscription', 'monthly', 'streaming'],
        weight: 0.9
      },
      spotify: {
        keys: ['spotify', 'spotify.com'],
        domains: ['spotify.com', 'no-reply@spotify.com'],
        keywords: ['spotify', 'premium', 'subscription', 'music'],
        weight: 0.9
      },
      disney_plus: {
        keys: ['disney+', 'disney plus', 'disneyplus'],
        domains: ['disneyplus.com', 'email.disneyplus.com'],
        keywords: ['disney+', 'disney plus', 'subscription', 'streaming'],
        weight: 0.9
      },
      hulu: {
        keys: ['hulu'],
        domains: ['hulu.com', 'mail.hulu.com'],
        keywords: ['hulu', 'subscription', 'streaming'],
        weight: 0.9
      },
      amazon_prime: {
        keys: ['amazon prime', 'prime video'],
        domains: ['amazon.com', 'primevideo.com'],
        keywords: ['amazon prime', 'prime video', 'subscription'],
        weight: 0.8
      },
      apple_tv: {
        keys: ['apple tv+', 'apple tv plus'],
        domains: ['apple.com'],
        keywords: ['apple tv+', 'apple tv plus', 'subscription'],
        weight: 0.8
      },
      hbo_max: {
        keys: ['hbo max', 'hbomax'],
        domains: ['hbomax.com', 'hbo.com'],
        keywords: ['hbo max', 'hbomax', 'subscription'],
        weight: 0.9
      },

      // Music Services
      apple_music: {
        keys: ['apple music'],
        domains: ['apple.com'],
        keywords: ['apple music', 'subscription', 'music'],
        weight: 0.9
      },
      youtube_music: {
        keys: ['youtube music', 'youtube premium'],
        domains: ['youtube.com', 'google.com'],
        keywords: ['youtube music', 'youtube premium', 'subscription'],
        weight: 0.8
      },
      pandora: {
        keys: ['pandora'],
        domains: ['pandora.com'],
        keywords: ['pandora', 'premium', 'subscription'],
        weight: 0.8
      },

      // Productivity Software
      microsoft_365: {
        keys: ['microsoft 365', 'office 365'],
        domains: ['microsoft.com', 'office365.com'],
        keywords: ['microsoft 365', 'office 365', 'subscription'],
        weight: 0.9
      },
      adobe_creative: {
        keys: ['adobe creative', 'creative cloud'],
        domains: ['adobe.com'],
        keywords: ['adobe creative', 'creative cloud', 'subscription'],
        weight: 0.9
      },
      slack: {
        keys: ['slack'],
        domains: ['slack.com'],
        keywords: ['slack', 'subscription', 'workspace'],
        weight: 0.8
      },
      zoom: {
        keys: ['zoom'],
        domains: ['zoom.us'],
        keywords: ['zoom', 'subscription', 'pro', 'business'],
        weight: 0.8
      },
      notion: {
        keys: ['notion'],
        domains: ['notion.so'],
        keywords: ['notion', 'subscription', 'plus', 'pro'],
        weight: 0.8
      },
      github: {
        keys: ['github'],
        domains: ['github.com'],
        keywords: ['github', 'subscription', 'pro', 'team'],
        weight: 0.8
      },

      // Storage Services
      dropbox: {
        keys: ['dropbox'],
        domains: ['dropbox.com'],
        keywords: ['dropbox', 'subscription', 'plus', 'professional'],
        weight: 0.8
      },
      google_drive: {
        keys: ['google drive', 'google one'],
        domains: ['google.com'],
        keywords: ['google drive', 'google one', 'subscription', 'storage'],
        weight: 0.8
      },
      icloud: {
        keys: ['icloud'],
        domains: ['apple.com', 'icloud.com'],
        keywords: ['icloud', 'subscription', 'storage'],
        weight: 0.8
      },

      // News & Publications
      new_york_times: {
        keys: ['new york times', 'nytimes'],
        domains: ['nytimes.com'],
        keywords: ['new york times', 'nytimes', 'subscription'],
        weight: 0.8
      },
      wall_street_journal: {
        keys: ['wall street journal', 'wsj'],
        domains: ['wsj.com'],
        keywords: ['wall street journal', 'wsj', 'subscription'],
        weight: 0.8
      },
      washington_post: {
        keys: ['washington post'],
        domains: ['washingtonpost.com'],
        keywords: ['washington post', 'subscription'],
        weight: 0.8
      },

      // Fitness & Health
      peloton: {
        keys: ['peloton'],
        domains: ['peloton.com'],
        keywords: ['peloton', 'membership', 'subscription'],
        weight: 0.8
      },
      fitbit: {
        keys: ['fitbit'],
        domains: ['fitbit.com'],
        keywords: ['fitbit', 'premium', 'subscription'],
        weight: 0.8
      },
      myfitnesspal: {
        keys: ['myfitnesspal'],
        domains: ['myfitnesspal.com'],
        keywords: ['myfitnesspal', 'premium', 'subscription'],
        weight: 0.7
      },

      // Shopping & Marketplaces
      amazon: {
        keys: ['amazon'],
        domains: ['amazon.com'],
        keywords: ['amazon', 'prime', 'subscription'],
        weight: 0.7
      },
      walmart_plus: {
        keys: ['walmart plus', 'walmart+'],
        domains: ['walmart.com'],
        keywords: ['walmart plus', 'walmart+', 'subscription'],
        weight: 0.7
      },

      // Communication
      discord: {
        keys: ['discord'],
        domains: ['discord.com'],
        keywords: ['discord', 'nitro', 'subscription'],
        weight: 0.8
      },
      skype: {
        keys: ['skype'],
        domains: ['skype.com', 'microsoft.com'],
        keywords: ['skype', 'subscription', 'premium'],
        weight: 0.7
      }
    };
  }

  initializeVendorIcons() {
    return {
      netflix: 'https://cdn-icons-png.flaticon.com/512/250/250474.png',
      spotify: 'https://cdn-icons-png.flaticon.com/512/2111/2111624.png',
      disney_plus: 'https://cdn-icons-png.flaticon.com/512/732/732344.png',
      hulu: 'https://cdn-icons-png.flaticon.com/512/8640/8640904.png',
      amazon_prime: 'https://cdn-icons-png.flaticon.com/512/250/250494.png',
      apple_tv: 'https://cdn-icons-png.flaticon.com/512/694/694690.png',
      hbo_max: 'https://cdn-icons-png.flaticon.com/512/888/888879.png',
      apple_music: 'https://cdn-icons-png.flaticon.com/512/888/888869.png',
      youtube_music: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
      pandora: 'https://cdn-icons-png.flaticon.com/512/2111/2111688.png',
      microsoft_365: 'https://cdn-icons-png.flaticon.com/512/732/732098.png',
      adobe_creative: 'https://cdn-icons-png.flaticon.com/512/596/596335.png',
      slack: 'https://cdn-icons-png.flaticon.com/512/2111/2111690.png',
      zoom: 'https://cdn-icons-png.flaticon.com/512/3536/3536665.png',
      notion: 'https://cdn-icons-png.flaticon.com/512/596/5962116.png',
      github: 'https://cdn-icons-png.flaticon.com/512/733/733553.png',
      dropbox: 'https://cdn-icons-png.flaticon.com/512/314/314456.png',
      google_drive: 'https://cdn-icons-png.flaticon.com/512/2965/2965309.png',
      icloud: 'https://cdn-icons-png.flaticon.com/512/870/870843.png',
      new_york_times: 'https://cdn-icons-png.flaticon.com/512/732/732338.png',
      wall_street_journal: 'https://cdn-icons-png.flaticon.com/512/732/732335.png',
      washington_post: 'https://cdn-icons-png.flaticon.com/512/732/732343.png',
      peloton: 'https://cdn-icons-png.flaticon.com/512/3536/3536669.png',
      fitbit: 'https://cdn-icons-png.flaticon.com/512/2111/2111732.png',
      myfitnesspal: 'https://cdn-icons-png.flaticon.com/512/2111/2111626.png',
      amazon: 'https://cdn-icons-png.flaticon.com/512/250/250494.png',
      walmart_plus: 'https://cdn-icons-png.flaticon.com/512/250/250506.png',
      discord: 'https://cdn-icons-png.flaticon.com/512/2111/2111330.png',
      skype: 'https://cdn-icons-png.flaticon.com/512/3536/3536661.png'
    };
  }

  normalizeText(text) {
    if (!text) return '';
    return text.toLowerCase()
      .replace(/[^\w\s@.-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  extractDomain(email) {
    if (!email) return '';
    const match = email.match(/@([^>\s]+)/);
    return match ? match[1].toLowerCase() : '';
  }

  calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  resolveVendor(sender, subject) {
    const normalizedSender = this.normalizeText(sender);
    const normalizedSubject = this.normalizeText(subject);
    const senderDomain = this.extractDomain(sender);

    let bestMatch = null;
    let bestScore = 0;

    for (const [vendorKey, config] of Object.entries(this.vendorMappings)) {
      let score = 0;
      let matchDetails = [];

      // Domain matching (highest weight)
      for (const domain of config.domains) {
        if (senderDomain.includes(domain) || domain.includes(senderDomain)) {
          score += 40;
          matchDetails.push(`domain_match:${domain}`);
          break;
        }
      }

      // Exact key matching in sender
      for (const key of config.keys) {
        const normalizedKey = this.normalizeText(key);
        if (normalizedSender.includes(normalizedKey)) {
          score += 30;
          matchDetails.push(`sender_key_match:${key}`);
        }
      }

      // Exact key matching in subject
      for (const key of config.keys) {
        const normalizedKey = this.normalizeText(key);
        if (normalizedSubject.includes(normalizedKey)) {
          score += 25;
          matchDetails.push(`subject_key_match:${key}`);
        }
      }

      // Keyword matching
      for (const keyword of config.keywords) {
        const normalizedKeyword = this.normalizeText(keyword);
        if (normalizedSubject.includes(normalizedKeyword)) {
          score += 15;
          matchDetails.push(`subject_keyword:${keyword}`);
        }
      }

      // Fuzzy matching for vendor name
      for (const key of config.keys) {
        const normalizedKey = this.normalizeText(key);
        const similarity = this.calculateStringSimilarity(normalizedSubject, normalizedKey);
        if (similarity > 0.7) {
          score += similarity * 20;
          matchDetails.push(`fuzzy_match:${key}:${similarity.toFixed(2)}`);
        }
      }

      // Apply vendor weight
      score *= config.weight;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          vendorKey,
          score,
          matchDetails,
          confidence: Math.min(score, 100)
        };
      }
    }

    return bestMatch || {
      vendorKey: 'unknown',
      score: 0,
      matchDetails: [],
      confidence: 0
    };
  }

  getVendorIcon(vendorKey) {
    return this.vendorIcons[vendorKey] || null;
  }

  generateDedupeHash(userId, sender, subject, timestamp) {
    const normalizedSender = this.normalizeText(sender);
    const normalizedSubject = this.normalizeText(subject);
    const timeWindow = Math.floor(timestamp / (24 * 60 * 60 * 1000)); // Daily window
    
    const hashInput = `${userId}:${normalizedSender}:${normalizedSubject}:${timeWindow}`;
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }
}

module.exports = new VendorResolverService();
