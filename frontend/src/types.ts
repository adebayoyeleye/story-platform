export interface Chapter {
    title: string;
    content: string;
}

export interface Story {
    id?: string; // Optional because MongoDB generates it
    title: string;
    author: string;
    synopsis: string;
    chapters: Chapter[];
}