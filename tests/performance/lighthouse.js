import lighthouse from 'lighthouse'
import { launch } from 'chrome-launcher'
import fs from 'fs'
import path from 'path'

const PERFORMANCE_THRESHOLDS = {
  performance: 85,
  accessibility: 95,
  'best-practices': 85,
  seo: 85,
}

async function runLighthouse(url, outputPath) {
  const chrome = await launch({ chromeFlags: ['--headless'] })
  
  try {
    const options = {
      logLevel: 'info',
      output: 'html',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    }
    
    const runnerResult = await lighthouse(url, options)
    
    // Generate report
    const reportHtml = runnerResult.report
    fs.writeFileSync(outputPath, reportHtml)
    
    // Check thresholds
    const scores = {}
    const categories = runnerResult.lhr.categories
    
    for (const [key, category] of Object.entries(categories)) {
      const score = Math.round(category.score * 100)
      scores[key] = score
      
      console.log(`${category.title}: ${score}`)
      
      if (score < PERFORMANCE_THRESHOLDS[key]) {
        console.error(`❌ ${category.title} score (${score}) is below threshold (${PERFORMANCE_THRESHOLDS[key]})`)
      } else {
        console.log(`✅ ${category.title} score (${score}) meets threshold`)
      }
    }
    
    return scores
  } finally {
    await chrome.kill()
  }
}

async function runPerformanceTests() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173'
  const outputDir = 'test-results/lighthouse'
  
  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true })
  
  const pages = [
    { url: baseUrl, name: 'homepage' },
    { url: `${baseUrl}/services`, name: 'services' },
    { url: `${baseUrl}/how-it-works`, name: 'how-it-works' },
  ]
  
  const results = {}
  
  for (const page of pages) {
    console.log(`\n🔍 Testing ${page.name} (${page.url})...`)
    
    const outputPath = path.join(outputDir, `${page.name}-report.html`)
    const scores = await runLighthouse(page.url, outputPath)
    
    results[page.name] = scores
    console.log(`📊 Report saved to ${outputPath}`)
  }
  
  // Save JSON results
  const jsonPath = path.join(outputDir, 'results.json')
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2))
  
  console.log(`\n📈 All results saved to ${jsonPath}`)
  
  // Overall summary
  console.log('\n📊 Performance Summary:')
  for (const [pageName, scores] of Object.entries(results)) {
    console.log(`\n${pageName}:`)
    for (const [category, score] of Object.entries(scores)) {
      const threshold = PERFORMANCE_THRESHOLDS[category]
      const status = score >= threshold ? '✅' : '❌'
      console.log(`  ${status} ${category}: ${score}/100 (threshold: ${threshold})`)
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceTests().catch(console.error)
}

export { runPerformanceTests }