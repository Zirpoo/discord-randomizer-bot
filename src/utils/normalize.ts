export function normalize(text: string) {
    return text.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}
