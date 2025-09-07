import { words } from "./word-bank";

const WORD_LIMIT = 50;
export function generatePassage() {
    let passage: string[] = []
    for (let i = 0; i < WORD_LIMIT; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        passage.push(words[randomIndex]);
    }

    let text = "";
    passage.map((word, i) => {
        if (i % 10 === 0 && i !== 0) {
            text = text.trim() + ". ";
            text += word.charAt(0).toUpperCase() + word.slice(1);
        }
        else {
            text += i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : " " + word;
        }
    });
    return text.trim() + ".";
}