// moodify\src\lib\custom-audio-adapter.ts




export const getStreamUrl = (url: string): string => {

    if (url.startsWith('http')) {
      return url;
    }
    
    return `https://discoveryprovider.audius.co/v1/tracks/stream/${url}?app_name=MOODIFY`;
  };
  
  export interface Track {
    id: string;
    title: string;
    user: {
      name: string;
    };
    artwork: {
      "150x150": string;
      "480x480"?: string;
      "1000x1000"?: string;
    };
    duration?: number;
    genre?: string;
    mood?: string;
    release_date?: string;
    permalink?: string;
    description?: string;
    [key: string]: any;
  }
  