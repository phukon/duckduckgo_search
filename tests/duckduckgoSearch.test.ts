import { describe, it, expect } from 'vitest'
import { DDGS } from '../src/duckduckgoSearch'

describe('DuckDuckGo Search Integration Tests', () => {
  it('should perform real search', async () => {
    const ddgs = new DDGS()
    const results = await ddgs.text({ 
      keywords: 'typescript programming' 
    })

    expect(results).toBeInstanceOf(Array)
    expect(results[0]).toMatchObject({
      title: expect.any(String),
      href: expect.any(String),
      body: expect.any(String)
    })
  }, { timeout: 10000 })

  it('should respect maxResults parameter', async () => {
    const ddgs = new DDGS()
    const maxResults = 5
    const results = await ddgs.text({
      keywords: 'nodejs',
      maxResults
    })

    expect(results.length).toBeLessThanOrEqual(maxResults)
  }, { timeout: 10000 })
})