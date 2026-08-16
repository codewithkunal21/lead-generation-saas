import httpx
from bs4 import BeautifulSoup
from typing import List, Optional
from src.app.services.scraper.base import BaseScraper, logger
from src.app.schemas.lead import LeadCreate

class GoogleMapsScraper(BaseScraper):
    """Scrapes local business leads from Google Maps."""

    async def scrape(self, query: str, limit: int = 10) -> List[LeadCreate]:
        """Scrape leads from Google Maps using Playwright."""
        leads = []
        encoded_query = query.replace(" ", "+")
        url = f"https://www.google.com/maps/search/{encoded_query}"
        
        async with self.get_browser() as browser:
            page = await browser.new_page()
            # Set a standard desktop User-Agent to avoid immediate blockings
            await page.set_extra_http_headers({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            })
            
            try:
                await page.goto(url, wait_until="networkidle", timeout=30000)
            except Exception as e:
                logger.error(f"Error loading Google Maps for query '{query}': {str(e)}")
                return leads

            # Attempt to wait for feed
            feed_selector = "div[role='feed']"
            try:
                await page.wait_for_selector(feed_selector, timeout=8000)
            except Exception:
                logger.warning("Feed container not found, trying direct elements discovery.")

            # Perform a few scroll operations on the feed to load more listings
            try:
                for _ in range(3):
                    feed_el = await page.query_selector(feed_selector)
                    if feed_el:
                        await page.eval_on_selector(feed_selector, "el => el.scrollBy(0, el.scrollHeight)")
                        await page.wait_for_timeout(1500)
            except Exception as e:
                logger.debug(f"Scrolling error: {e}")

            # Collect business place links (Google Maps links start with /maps/place/)
            links = await page.query_selector_all('a[href*="/maps/place/"]')
            urls = []
            for link in links:
                href = await link.get_attribute("href")
                if href and href not in urls:
                    urls.append(href)
                if len(urls) >= limit:
                    break

            # If no items found, try fallback selectors (e.g. class-based search anchors)
            if not urls:
                logger.info("No place URLs found via default selector. Trying search list fallbacks.")
                fallbacks = await page.query_selector_all('a[href*="/place/"]')
                for f in fallbacks:
                    href = await f.get_attribute("href")
                    if href and href not in urls:
                        urls.append(href)
                    if len(urls) >= limit:
                        break

            # Scrape individual business listings
            for detail_url in urls:
                try:
                    await page.goto(detail_url, wait_until="networkidle", timeout=20000)
                    
                    # Extract Name
                    name_el = await page.query_selector("h1")
                    name = await name_el.inner_text() if name_el else "Unknown Business"
                    
                    # Extract Rating
                    rating = None
                    rating_el = await page.query_selector("div.F7nice span span")
                    if rating_el:
                        rating_text = await rating_el.inner_text()
                        try:
                            rating = float(rating_text.replace(",", ".").strip())
                        except ValueError:
                            pass
                            
                    # Extract Address
                    address_el = await page.query_selector('button[data-item-id="address"]')
                    address = await address_el.inner_text() if address_el else None
                    if address:
                        address = address.strip()

                    # Extract Phone Number
                    phone_el = await page.query_selector('button[data-item-id^="phone:tel:"]')
                    phone = await phone_el.inner_text() if phone_el else None
                    if phone:
                        phone = phone.replace("Phone:", "").strip()

                    # Extract Website
                    website_el = await page.query_selector('a[data-item-id="authority"]')
                    website = await website_el.get_attribute("href") if website_el else None

                    # If a website is available, crawl it asynchronously to fetch contact email addresses
                    email = None
                    if website:
                        email = await self.crawl_for_email(website)

                    leads.append(LeadCreate(
                        query=query,
                        name=name.strip(),
                        phone=phone,
                        email=email,
                        website=website,
                        address=address,
                        rating=rating
                    ))

                except Exception as e:
                    logger.error(f"Error extracting details from place listing '{detail_url}': {str(e)}")

        return leads

    async def crawl_for_email(self, url: str) -> Optional[str]:
        """Perform a simple homepage crawl to check for public emails."""
        try:
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
                response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, "lxml")
                    emails = self.extract_emails_from_text(soup.get_text())
                    if emails:
                        return emails[0]
        except Exception as e:
            logger.debug(f"Email crawl failed for {url}: {str(e)}")
        return None
