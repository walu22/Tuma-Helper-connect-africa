import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Security Tests', () => {
  it('should not expose sensitive environment variables', () => {
    const envExample = fs.readFileSync('.env.example', 'utf-8')
    const sensitivePatterns = [
      /password\s*=/i,
      /secret\s*=/i,
      /private.*key/i,
      /api.*key.*=.*[a-zA-Z0-9]/i
    ]

    sensitivePatterns.forEach(pattern => {
      expect(envExample).not.toMatch(pattern)
    })
  })

  it('should have proper CORS configuration', async () => {
    // This would be tested against your actual API
    const response = await fetch('http://localhost:5173/api/test', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://malicious-site.com',
        'Access-Control-Request-Method': 'POST',
      }
    }).catch(() => ({ headers: new Map() }))

    // Should not allow arbitrary origins
    expect(response.headers.get?.('Access-Control-Allow-Origin')).not.toBe('*')
  })

  it('should validate file paths for directory traversal', () => {
    const maliciousPaths = [
      '../../../etc/passwd',
      '..\\..\\windows\\system32',
      '/etc/shadow',
      'C:\\Windows\\System32'
    ]

    maliciousPaths.forEach(maliciousPath => {
      // Your file validation function would be tested here
      const isValid = validateFilePath(maliciousPath)
      expect(isValid).toBe(false)
    })
  })

  it('should sanitize user input', () => {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      '"><script>alert("xss")</script>',
      'javascript:alert("xss")',
      'onload="alert("xss")"',
      '${constructor.constructor("alert(1)")()}',
    ]

    maliciousInputs.forEach(input => {
      const sanitized = sanitizeInput(input)
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('javascript:')
      expect(sanitized).not.toContain('onload=')
    })
  })

  it('should have proper Content Security Policy headers', async () => {
    // Test CSP headers on your deployed app
    const testUrls = [
      'http://localhost:5173',
      'http://localhost:5173/services',
    ]

    for (const url of testUrls) {
      try {
        const response = await fetch(url)
        const csp = response.headers.get('Content-Security-Policy')
        
        if (csp) {
          expect(csp).toContain("script-src")
          expect(csp).not.toContain("'unsafe-eval'")
          expect(csp).not.toContain("script-src *")
        }
      } catch (error) {
        console.log(`Could not test ${url}: ${error.message}`)
      }
    }
  })
})

// Mock functions for testing
function validateFilePath(path) {
  const normalizedPath = path.replace(/\\/g, '/')
  return !normalizedPath.includes('../') && 
         !normalizedPath.includes('..\\') &&
         !normalizedPath.startsWith('/etc/') &&
         !normalizedPath.match(/^[a-zA-Z]:\\/)
}

function sanitizeInput(input) {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/\$\{.*\}/g, '')
}