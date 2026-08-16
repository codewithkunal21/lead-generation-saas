import re
import httpx
from bs4 import BeautifulSoup
from typing import List, Optional
from src.app.services.scraper.base import BaseScraper, logger
from src.app.schemas.lead import LeadCreate

class GoogleSearchScraper(BaseScraper):
    """Scrapes local business leads by crawling organic Google search results."""

    async def scrape(self, query: str, limit: int = 5) -> List[LeadCreate]:
        """Scrape organic results from Google Search."""
        leads = []
        encoded_query = query.replace(" ", "+")
        url = f"https://www.google.com/search?q={encoded_query}"
        
        async with self.get_browser() as browser:
            page = await browser.new_page()
            await page.set_extra_http_headers({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            })
            
            try:
                await page.goto(url, wait_until="networkidle", timeout=30000)
            except Exception as e:
                logger.error(f"Error loading Google Search: {str(e)}")
                return leads

            # Extract organic result anchors
            anchors = await page.query_selector_all("div.g a")
            urls = []
            
            # Directory and portal domains to exclude to focus on actual business websites
            excluded_domains = [
                "wikipedia.org", "yelp.com", "yellowpages.com", "facebook.com", 
                "twitter.com", "linkedin.com", "tripadvisor.com", "instagram.com", 
                "youtube.com", "justdial.com", "indiamart.com", "pinterest.com"
            ]
            
            for anchor in anchors:
                href = await anchor.get_attribute("href")
                if href and href.startswith("http"):
                    # Exclude portals and social media links
                    if not any(domain in href for domain in excluded_domains):
                        # Get root/clean link
                        clean_url = href.split("?")[0]
                        if clean_url not in urls:
                            urls.append(clean_url)
                if len(urls) >= limit:
                    break

            # Visit each website and extract contact parameters
            for site_url in urls:
                try:
                    lead = await self.scrape_website(site_url, query)
                    if lead:
                        leads.append(lead)
                except Exception as e:
                    logger.error(f"Error processing website '{site_url}': {str(e)}")
                    
        return leads

    async def scrape_website(self, url: str, query: str) -> Optional[LeadCreate]:
        """Crawl a target business homepage to extract details."""
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
                response = await client.get(url, headers=headers)
                if response.status_code != 200:
                    return None
                    
                soup = BeautifulSoup(response.text, "lxml")
                raw_text = soup.get_text()
                
                # Determine Business Name
                name = None
                title_tag = soup.find("title")
                if title_tag:
                    # Strip standard titles like "Home - MyBusiness"
                    name_parts = re.split(r'[-|]', title_tag.get_text())
                    if name_parts:
                        name = name_parts[0].strip()
                        
                if not name or name.lower() in ["home", "welcome", "index"]:
                    h1_tag = soup.find("h1")
                    name = h1_tag.get_text().strip() if h1_tag else None
                    
                if not name:
                    name = "Unknown Business"

                # Extract contact metrics
                emails = self.extract_emails_from_text(raw_text)
                phones = self.extract_phones_from_text(raw_text)
                
                email = emails[0] if emails else None
                phone = phones[0] if phones else None
                
                # Check for address tags or common patterns
                address = None
                address_tag = soup.find("address") or soup.find(class_=lambda x: x and "address" in x.lower())
                if address_tag:
                    address = self.clean_text(address_tag.get_text())
                    
                if not address:
                    # Fallback regex lookups for street addresses / zip combinations
                    address_match = re.search(r'\d{1,5}\s+[A-Za-z0-9\s,\.]+,\s*[A-Z]{2,}\s+\d{5,6}', raw_text)
                    if address_match:
                        address = self.clean_text(address_match.group(0))

                return LeadCreate(
                    query=query,
                    name=name,
                    phone=phone,
                    email=email,
                    website=url,
                    address=address,
                    rating=None
                )
        except Exception as e:
            logger.debug(f"Website scrap check failed for {url}: {str(e)}")
        return None
