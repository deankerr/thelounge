import {SharedMsg} from "./msg";

export type SearchQuery = {
	searchTerm: string;
	networkUuid: string;
	channelName: string;
	offset: number;
	nick?: string;
};

export type SearchResponse = SearchQuery & {
	results: SharedMsg[];
};
