import { test, expect } from "@playwright/test";
import { GenerationPage } from "./pages/GenerationPage";
import { LoginPage } from "./pages/LoginPage";
import { TopbarPage } from "./pages/TopbarPage";
import { FlashcardsPage } from "./pages/flashcards/FlashcardsPage";
import randomstring from "randomstring";
import { FlashcardModalPage } from "./pages/flashcards/FlashcardModalPage";

test.describe("AI Flashcard Generation", () => {
  let loginPage: LoginPage;

  const sampleText = `Jak już wspomniałem początkowo Gumisiów było sześciu. Najstarsza z nich to Bunia, która zarządzała kuchnią i która jako jedyna zna przepis na sok z gummijagód dających gumisiom możliwość wysokich skoków 
  (istoty ludzkie po wypiciu takiej mikstury zostają obarczone na krótki czas nadludzką siłą). 
  Gumiś Zami jest potomkiem jakiegoś maga bowiem zna się z kolei na czarach, z tym że musi nieco więcej potrenować i mieć wiary w siebie bo czary mu niezbyt wychodzą. 
  Kolejnym Gumisiem jest Grafi, złota rączka, potrafi zrobić wszystko w domu ale też i straszna maruda oraz zrzęda. 
  Tami zaś potrafi dużo jeść i często można go znaleźć w kuchni kiedy Bunia przygotowuje posiłek. Sani zaś marzy o byciu księżniczką i o dalekich podróżach. 
  Jej królewskie marzenie spełni się aczkolwiek nie była na to przygotowana do końca jednak przy okazji bycia księżniczką poznała prawdziwą księżniczkę, która stała się jej przyjaciółką - księżniczkę Kalę. 
  Pozostał jeszcze najmłodszy z gumisiów czyli Kabi, uwielbiający być rycerzem, od czasu do czasu staje się Karmazynowym Mścicielem. 
  Dobrze się dogaduje z Kevinem bowiem mają te same marzenia. Z czasem do Gumisiów dołącza Gusto, który jest artystą a jego pasją jest malowanie.`;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.E2E_USERNAME || "", process.env.E2E_PASSWORD || "");
    await loginPage.waitForRedirectToGenerate();
  });

  test("Login -> Generate -> Save all -> Flashcards -> Search -> Edit -> Logout", async ({ page }) => {
    const generationPage = new GenerationPage(page);
    const topbarPage = new TopbarPage(page);
    const flashcardsPage = new FlashcardsPage(page);
    const flashcardModal = new FlashcardModalPage(page);

    await expect(page).toHaveURL("/generate");
    await generationPage.enterText(sampleText);
    expect(await generationPage.isGenerateButtonEnabled()).toBeTruthy();

    await generationPage.clickGenerate();
    await generationPage.saveAllFlashcards();

    await topbarPage.navigateToFlashcards();

    await flashcardsPage.waitForSpinnerToDisappear(5000);
    await flashcardsPage.searchFlashcards("Gumiś");

    const flashcards = await flashcardsPage.getAllFlashcardItems();
    expect(flashcards.length).toBeGreaterThan(0);

    const firstFlashcard = flashcards[0];
    await firstFlashcard.clickEdit();

    const randomString = randomstring.generate(10);
    let front = await flashcardModal.getFrontInput().inputValue();
    front = front + randomString;
    const back = await flashcardModal.getBackInput().inputValue();

    await flashcardModal.editFlashcard(front, back);

    await flashcardsPage.clearSearch();
    await flashcardsPage.searchFlashcards(randomString);

    const editedFlashcards = await flashcardsPage.getAllFlashcardItems();
    expect(editedFlashcards.length).toEqual(1);

    await topbarPage.logout();
  });
});
