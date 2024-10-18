export const days = [
	// day 1
	[
		[['plot points', 'visualization of data'], 'graph', [3, 5]],
		[['artist’s hot spot', 'potter’s need'], 'kiln', [2, 3]],
		[['consider (as options)', 'take the measure of'], 'weigh', [1, 5]],
		[['Ancient Greek drama critics?', 'group of singers'], 'chorus', [0, 2]],
		['fleɪk', 'flake'],
	],

	// day 2
	[
		[['folksy medicine accompaniment', 'coffee sweetener'], 'sugar', [0, 1]],
		[
			['what you can’t have if you don’t eat your meat', 'tapioca, e.g'],
			'pudding',
			[5, 6],
		],
		[['teach (or place to teach)', 'group of fish'], 'school', [1, 3]],
		['ʃʊk', 'shook'],
	],

	// day 3
	[
		[['one found in a garden', 'elf'], 'gnome', [0, 2]],
		[['rage', 'fiesta'], 'party', [4, 5]],
		[['involve in an affair?', 'interfere'], 'meddle', [2, 4]],
		[['medium, e.g.', 'scrutinize, with “up”'], 'size', [2, 3]],
		['nidz', 'needs', 'kneads'],
	],

	// day 4
	[
		[['trench', 'slop container'], 'trough', [4, 6]],
		[['animal with a sixth sense', 'baseball need'], 'bat', [1, 2]],
		[['noggin', 'the worst part of a fruit salad, for some'], 'melon', [2, 3]],
		[['darling', 'Pooh’s vice'], 'honey', [1, 2]],
		[['might describe a room or a relationship', 'cluttered'], 'messy', [2, 4]],
		[
			['middle of Ender’s Game?', 'it can show possession'],
			'apostrophe',
			[9, 10],
		],
		['fæləsi', 'fallacy'],
	],

	// day 5
	[
		[['delays (in video games?)', 'falls behind'], 'lags', [3, 4]],
		[['killed the dragon', 'whole ton of'], 'slew', [2, 4]],
		[['hitchhiked', 'flipped (as through a book)'], 'thumbed', [3, 5]],
		['zum', 'zoom'],
	],
	// the format:
	// 	[
	// 		[['clue', 'easy clue'], 'hook', [sliceStartIndex, sliceIndexEnd]],
	// 		...[""],
	// 		['ipa transcription', 'solution / translation'], (when you put the bytes together you get the "gloss")
	// 	],
]

export const CLUE_INDEX = 0
export const ANSWER_INDEX = 1
export const BITE_ARGS = 2 // the ".slice" args for the answer's substring that is the sound bite
