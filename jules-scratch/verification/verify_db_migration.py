from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # The expo server runs on 8081
        page.goto("http://localhost:8081", timeout=90000)

        # Wait for the app to load
        page.wait_for_selector('div[data-testid="BottomTabNavigator"]', timeout=60000)

        # Navigate to Seed Bank
        page.get_by_text("SeedBank").click()

        # Check for a known plant
        expect(page.get_by_text("Tomato")).to_be_visible(timeout=10000)
        expect(page.get_by_text("Lettuce (Loose Leaf)")).to_be_visible()

        page.screenshot(path="jules-scratch/verification/01_seed_bank.png")

        # Navigate to My Garden
        page.get_by_text("MyGarden").click()

        # Add a plant to the garden
        page.get_by_text("Add New Plant").click()

        # Select a plant from the seed bank (we need to add one first)
        # Go back to seed bank and add a plant
        page.get_by_text("Go to Seed Bank").click()
        page.get_by_text("Tomato").click() # Select tomato
        page.get_by_text("MyGarden").click()

        # Now add the plant
        page.get_by_text("Add New Plant").click()
        page.get_by_text("Tomato").click()
        page.get_by_text("Next").click()
        page.get_by_text("Add to Garden").click()

        # Wait for the alert to be gone
        page.wait_for_selector('text=Success!', state='detached')

        # Check that the plant is in the garden
        expect(page.get_by_text("Tomato", exact=True)).to_be_visible()
        expect(page.get_by_text("Type: Tomato")).to_be_visible()

        page.screenshot(path="jules-scratch/verification/02_my_garden.png")

    except Exception as e:
        print(page.content())
        raise e
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
