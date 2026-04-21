#!/usr/bin/env node

/**
 * Security Audit Script for Hotel Management System
 * Run with: node security-audit.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityAuditor {
  constructor() {
    this.vulnerabilities = [];
    this.warnings = [];
  }

  logVulnerability(level, category, description, file, line, recommendation) {
    this.vulnerabilities.push({
      level,
      category,
      description,
      file,
      line,
      recommendation
    });
  }

  logWarning(category, description, file, recommendation) {
    this.warnings.push({
      category,
      description,
      file,
      recommendation
    });
  }

  async auditFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fileName = path.basename(filePath);

    // Check for hardcoded secrets
    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Check for hardcoded JWT secrets
      if (line.includes('secret123') || line.includes('your-super-secret')) {
        this.logVulnerability('HIGH', 'Hardcoded Secrets', 'Hardcoded JWT secret detected', filePath, lineNum,
          'Use environment variables for secrets: process.env.JWT_SECRET');
      }

      // Check for console.log of sensitive data
      if (line.includes('console.log') && (line.includes('password') || line.includes('token') || line.includes('secret'))) {
        this.logVulnerability('MEDIUM', 'Information Disclosure', 'Logging sensitive data detected', filePath, lineNum,
          'Never log passwords, tokens, or secrets');
      }

      // Check for eval usage
      if (line.includes('eval(')) {
        this.logVulnerability('HIGH', 'Code Injection', 'Use of eval() detected', filePath, lineNum,
          'Avoid eval() as it can execute malicious code');
      }

      // Check for innerHTML without sanitization
      if (line.includes('innerHTML') && !line.includes('sanitize') && !line.includes('escape')) {
        this.logWarning('XSS', 'Potential XSS vulnerability with innerHTML', filePath, lineNum,
          'Sanitize HTML content before using innerHTML');
      }

      // Check for SQL injection patterns (though using MongoDB)
      if (line.includes('$where') || line.includes('eval') || line.includes('new Function')) {
        this.logVulnerability('HIGH', 'Injection', 'Potential NoSQL injection vulnerability', filePath, lineNum,
          'Use parameterized queries and validate inputs');
      }
    });

    // File-specific checks
    if (fileName === 'server.js') {
      if (!content.includes('helmet(')) {
        this.logWarning('Security Headers', 'Missing security headers (helmet)', filePath,
          'Install and use helmet middleware for security headers');
      }

      if (!content.includes('rateLimit') && !content.includes('express-rate-limit')) {
        this.logWarning('Rate Limiting', 'No rate limiting implemented', filePath,
          'Implement rate limiting to prevent brute force attacks');
      }

      if (content.includes("origin: ['http://localhost")) {
        this.logWarning('CORS', 'CORS allows localhost in production', filePath,
          'Restrict CORS origins in production environment');
      }
    }

    if (fileName === 'auth.js') {
      if (!content.includes('saltRounds = 14') && !content.includes('saltRounds = 12') && !content.includes('bcrypt.hash(password, 14') && !content.includes('bcrypt.hash(password, 12')) {
        this.logWarning('Password Security', 'Weak password hashing', filePath,
          'Use at least 12 rounds for bcrypt');
      }

      if (!content.includes('validatePassword')) {
        this.logWarning('Password Policy', 'No password complexity requirements', filePath,
          'Implement password complexity validation');
      }
    }

    if (fileName === 'receipts.js') {
      if (!content.includes('auth,')) {
        this.logVulnerability('HIGH', 'Authorization', 'Receipts endpoint not protected', filePath,
          'Add authentication middleware to protect sensitive endpoints');
      }
    }
  }

  async auditDependencies() {
    try {
      const packagePath = fs.existsSync('backend/package.json') ? 'backend/package.json' : 'package.json';
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Check for vulnerable packages (simplified check)
      const vulnerablePackages = {
        'express': { maxSafe: '4.18.2', current: dependencies.express },
        'mongoose': { maxSafe: '7.6.0', current: dependencies.mongoose }
      };

      Object.entries(vulnerablePackages).forEach(([pkg, info]) => {
        if (info.current && info.current.includes('^')) {
          this.logWarning('Dependencies', `Package ${pkg} uses ^ version, may auto-update to vulnerable versions`,
            'backend/package.json', 'Use exact versions for critical security packages');
        }
      });

    } catch (error) {
      this.logWarning('Audit Error', 'Could not check package.json', 'backend/package.json',
        'Ensure package.json exists and is valid');
    }
  }

  async runAudit() {
    console.log('🔒 Running Security Audit...\n');

    // Audit backend files
    const backendFiles = [
      'backend/server.js',
      'backend/routes/auth.js',
      'backend/routes/bookings.js',
      'backend/routes/payments.js',
      'backend/routes/receipts.js',
      'backend/services/pdfGenerator.js',
      'backend/services/whatsapp.js'
    ];

    // Check if we're in the right directory
    const altBackendFiles = [
      'server.js',
      'routes/auth.js',
      'routes/bookings.js',
      'routes/payments.js',
      'routes/receipts.js',
      'services/pdfGenerator.js',
      'services/whatsapp.js'
    ];

    const filesToCheck = backendFiles.some(f => fs.existsSync(f)) ? backendFiles : altBackendFiles;

    for (const file of backendFiles) {
      if (fs.existsSync(file)) {
        await this.auditFile(file);
      } else {
        this.logWarning('File Check', `File not found: ${file}`, file, 'Ensure all files exist');
      }
    }

    // Audit dependencies
    await this.auditDependencies();

    // Generate report
    this.generateReport();
  }

  generateReport() {
    console.log('📊 SECURITY AUDIT REPORT\n');

    if (this.vulnerabilities.length > 0) {
      console.log('🚨 VULNERABILITIES FOUND:');
      this.vulnerabilities.forEach((vuln, index) => {
        console.log(`${index + 1}. [${vuln.level}] ${vuln.category}`);
        console.log(`   ${vuln.description}`);
        console.log(`   File: ${vuln.file}:${vuln.line}`);
        console.log(`   Fix: ${vuln.recommendation}\n`);
      });
    } else {
      console.log('✅ No critical vulnerabilities found!');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.category}`);
        console.log(`   ${warning.description}`);
        console.log(`   File: ${warning.file}`);
        console.log(`   Fix: ${warning.recommendation}\n`);
      });
    }

    const score = Math.max(0, 100 - (this.vulnerabilities.length * 20) - (this.warnings.length * 5));
    console.log(`🔒 Security Score: ${score}/100`);

    if (score >= 80) console.log('🟢 GOOD: System is reasonably secure');
    else if (score >= 60) console.log('🟡 FAIR: Address warnings to improve security');
    else console.log('🔴 POOR: Critical vulnerabilities need immediate attention');
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.runAudit().catch(console.error);
}

module.exports = SecurityAuditor;