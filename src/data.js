export const days = [
	{
		name: 'Day One',
		data: [
			[['folksy medicine accompaniment', 'sweet crystal'], 'sugar', [0, 1]],
			[['discreet', 'cautious'], 'careful', [5, 6]],
			[['teach', 'place of learning'], 'school', [1, 3]],
			['ʃʊk', 'shook'],
		],
	},
	{
		name: 'Day Two',
		data: [
			[['one found in a garden', 'elf'], 'gnome', [0, 2]],
			[['rage', 'fiesta'], 'party', [4, 5]],
			[['sacrifice', 'tk'], 'martyr', [3, 4]],
			[['most prominent of 32', 'tk'], 'incisor', [4, 5]],
			['nidz', 'needs'],
		],
	},
	{
		name: 'Day Three',
		data: [
			[['delays (in video games?)', 'falls behind'], 'lags', [3, 4]],
			[['killed the dragon', 'whole ton of'], 'slew', [2, 4]],
			[['hitchhiked', 'flipped (as through a book)'], 'thumbed', [3, 5]],
			['sum', 'zoom'],
		],
	},
	{
		name: 'Day Four',
		data: [
			[['plot points', 'visualization of data'], 'graph', [3, 5]],
			[['artist’s hot spot', 'potter’s need'], 'kiln', [2, 3]],
			[['consider (as options)', 'take the measure of'], 'weigh', [1, 5]],
			[['Ancient Greek drama critics?', 'group of singers'], 'chorus', [0, 2]],
			['fleɪk', 'flake'],
		],
	},
	{
		name: 'Day Five',
		data: [
			[
				[
					'Steph Curry shooting threes, according to fans',
					'location for images of world leaders',
				],
				'money',
				[1, 2],
			],
			[['2023 it girl with many careers', 'tk'], 'barbie', [0, 2]],
			[['many a Disney anthem', 'tk'], 'ballad', [2, 5]],
			[['trip for a believer or an explorer', 'tk'], 'mission', [2, 4]],
			['əbɔlɪʃ', 'abolish'],
		],
	},
	{
		name: 'Day Six',
		data: [
			[['slop container', 'tk'], 'trough', [4, 6]],
			[['animal with a sixth sense', 'tk'], 'bat', [1, 2]],
			[['the worst part of a fruit salad, for some', 'tk'], 'melon', [2, 3]],
			[['darling', 'tk'], 'honey', [1, 2]],
			[['might describe a room or a relationship', 'tk'], 'messy', [2, 4]],
			[['middle of Ender’s Game?', ''], 'apostrophe', [9, 10]],
			['fælɪsi', 'fallacy'],
		],
	},
	// the format:
	// {
	// 	name: '',
	// 	url: '?q=2',
	// 	data: [
	// 		[['clue', 'easy clue'], 'hook', [sliceStartIndex, sliceIndexEnd]],
	// 		...[""],
	// 		['ipa transcription', 'solution / translation'], (when you put the bytes together you get the "gloss")
	// 	],
	// },
]

export const CLUE_INDEX = 0
export const ANSWER_INDEX = 1
export const BITE_ARGS = 2 // the ".slice" args for the answer's substring that is the sound bite
