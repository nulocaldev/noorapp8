
import { QURAN_API_BASE, QURAN_TRANSLATION_ID, QURAN_TRANSLITERATION_ID } from '../constants';
import { Surah, Ayah, AyahWithTranslation, Reciter, AudioFile, VerseTiming } from '../types';

const handleApiError = async (response: Response, serviceName: string) => {
    if (!response.ok) {
        let errorBody = 'Could not read error body.';
        try {
            errorBody = await response.text();
        } catch(e) {
            // ignore
        }
        console.error(`[${serviceName}] API Error ${response.status}: ${response.statusText}`, errorBody);
        throw new Error(`Failed to fetch from ${serviceName}: ${response.status} ${response.statusText}`);
    }
    return response.json();
};

const safeFetch = async (url: string, options: RequestInit, serviceName: string) => {
    try {
        const response = await fetch(url, options);
        return handleApiError(response, serviceName);
    } catch (error) {
        console.error(`[${serviceName}] Network or parsing error for ${url}:`, error);
        if (error instanceof Error) {
            throw new Error(`Network error in ${serviceName}: ${error.message}`);
        }
        throw new Error(`An unknown network error occurred in ${serviceName}.`);
    }
};


// --- Quran API Service ---

export async function fetchSurahs(): Promise<Surah[]> {
    const data = await safeFetch(`${QURAN_API_BASE}/chapters`, {}, 'quran.com/chapters');
    return data.chapters;
}

export async function fetchSurah(surahNumber: number): Promise<Surah> {
    const data = await safeFetch(`${QURAN_API_BASE}/chapters/${surahNumber}`, {}, `quran.com/chapters/${surahNumber}`);
    return data.chapter;
}

export async function fetchQuranPage(pageNumber: number): Promise<AyahWithTranslation[]> {
    const url = `${QURAN_API_BASE}/verses/by_page/${pageNumber}?translations=${QURAN_TRANSLATION_ID},${QURAN_TRANSLITERATION_ID}&fields=text_uthmani`;
    
    const versesData = await safeFetch(url, {}, `quran.com/verses_and_translations_by_page/${pageNumber}`);

    const versesFromApi: any[] = versesData.verses;

    return versesFromApi.map(verse => {
        const translationObj = verse.translations?.find((t: any) => t.resource_id === QURAN_TRANSLATION_ID);
        const transliterationObj = verse.translations?.find((t: any) => t.resource_id === QURAN_TRANSLITERATION_ID);
        
        return {
            id: verse.id,
            verse_key: verse.verse_key,
            text_uthmani: verse.text_uthmani,
            translation: translationObj?.text || 'Translation not found.',
            transliteration: transliterationObj ? transliterationObj.text.replace(/<[^>]+>/g, '') : undefined
        };
    });
}

export async function fetchSurahWithTranslation(surahNumber: number): Promise<AyahWithTranslation[]> {
    const versesUrl = `${QURAN_API_BASE}/quran/verses/uthmani?chapter_number=${surahNumber}`;
    const translationUrl = `${QURAN_API_BASE}/quran/translations/${QURAN_TRANSLATION_ID}?chapter_number=${surahNumber}`;

    const [versesData, translationData] = await Promise.all([
        safeFetch(versesUrl, {}, 'quran.com/verses'),
        safeFetch(translationUrl, {}, 'quran.com/translations')
    ]);
    
    const verses: Ayah[] = versesData.verses;
    const translations: { [verse_key: string]: string } = translationData.translations.reduce((acc: any, t: any) => {
        acc[t.verse_key] = t.text;
        return acc;
    }, {});

    return verses.map(verse => ({
        ...verse,
        translation: translations[verse.verse_key] || 'Translation not found.'
    }));
}

export async function fetchReciters(): Promise<Reciter[]> {
    const data = await safeFetch(`${QURAN_API_BASE}/resources/recitations?language=en`, {}, 'quran.com/recitations');
    return data.recitations;
}

export async function fetchAudioFile(reciterId: number, surahNumber: number): Promise<AudioFile> {
    const data = await safeFetch(`${QURAN_API_BASE}/recitations/${reciterId}/audio_files?chapter=${surahNumber}`, {}, 'quran.com/audio_files');
    return data.audio_files[0];
}

export async function fetchAudioTimings(reciterId: number, surahNumber: number): Promise<VerseTiming[]> {
    const data = await safeFetch(`${QURAN_API_BASE}/quran/recitations/${reciterId}/timed_text?verse_key=${surahNumber}:1-300`, {}, 'quran.com/timed_text');
    return data.timed_text;
}
