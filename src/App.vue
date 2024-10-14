<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import SoundBite from './components/SoundBite.vue'

const CLUE_INDEX = 0
const ANSWER_INDEX = 1
const BITE_ARGS = 2 // the ".slice" args for the answer's substring that is the sound bite

// todo:
// 1. only fill out bites if the whole word is correct
// 2. add sound files to correct words to clarify pronunciation

let days = [
	{
		name: 'Day One',
		url: '?q=1',
		// the format:
		// 		return [
		// 				[['clue', 'alternate clue'], 'hook', [sliceStartIndex, sliceIndexEnd]],
		//				""
		//				""
		//				['ipa transcription', 'solution / translation'] (when you put the bytes together you get the "gloss"
		// 			]

		data: [
			[['folksy medicine accompaniment', 'sweet crystal'], 'sugar', [0, 1]],
			[['discreet', 'cautious'], 'careful', [5, 6]],
			[['teach', 'place of learning'], 'school', [1, 3]],
			['ʃʊk', 'shook'],
		],
	},
	{
		name: 'Day Two',
		url: '?q=2',
		data: [
			[['plot points', 'visualization of data'], 'graph', [3, 5]],
			[['artist’s hot spot', 'potter’s need'], 'kiln', [2, 3]],
			[['consider (as options)', 'take the measure of'], 'weigh', [1, 5]],
			[['Ancient Greek drama critics?', 'group of singers'], 'chorus', [0, 2]],
			['fleɪk', 'flake'],
		],
	},
]

let url = new URL(location.href)
let activeDay = ref(Number.parseInt(url.searchParams.get('q')) || 1)

// this will come from server or something
let data = computed(() => days[activeDay.value - 1].data)

let clues = computed(() => data.value.slice(0, -1))

let ipa = computed(() => data.value.at(-1)[0])
let solution = computed(() => data.value.at(-1)[1])

let bites = computed(() =>
	clues.value.map(([, , bites]) => bites).reduce((x, [a, b]) => x + b - a, 0),
) // sum of bite lengths
let answers = computed(() => clues.value.map(([, clue]) => clue))
let longest = computed(() =>
	Math.max(
		bites.value,
		...clues.value.map(([, answer]) => answer.length), // length of answers
	),
)

let hooks = computed(() =>
	clues.value.map(([, answer]) => new Array(answer.length).fill(' ')),
)

let selectedHook = computed(() => hooks.value[selectedWordIndex.value])

let clueEls = ref([])

let selectedWordIndex = ref(0)
let selectedLetterIndex = ref(0)

watch(selectedWordIndex, (index) => {
	if (index < 0) selectedWordIndex.value = clues.value.length - 1
	if (index >= clues.value.length) selectedWordIndex.value = 0
	selectedLetterIndex.value =
		selectedHook.value?.findIndex((letter) => letter === ' ') || 0
})
let selectedWord = computed(
	() => clues.value[selectedWordIndex.value][ANSWER_INDEX],
)

watch(selectedLetterIndex, (index, oldIndex) => {
	if (index < 0) selectedLetterIndex.value = selectedWord.value.length - 1
	if (index >= selectedWord.value.length) selectedLetterIndex.value = 0
	if (
		index === 0 &&
		oldIndex !== 1 &&
		!selectedHook.value?.some((char) => char === ' ')
	) {
		// let nextIncompleteWordIndex =
		// todo: advance to the next blank space in the next word, if there is one, or to the final input if not
		selectedWordIndex.value += 1
	}
})

function handleDelete() {
	if (
		selectedLetterIndex.value > 0 &&
		selectedHook.value?.[selectedLetterIndex.value] === ' '
	) {
		// if they're on a blank space, they probably wanted to delete the previous letter
		selectedHook.value.splice(selectedLetterIndex.value - 1, 1, ' ')
		selectedLetterIndex.value -= 1
	} else {
		// else delete the current letter and stay where we are.
		hooks.value[selectedWordIndex.value].splice(
			selectedLetterIndex.value,
			1,
			' ',
		)
	}
}

function handleInput(e) {
	if (e.keyCode < 65 || !/\p{L}/u.test(e.key)) return
	hooks.value[selectedWordIndex.value].splice(
		selectedLetterIndex.value,
		1,
		e.key,
	)
	selectedLetterIndex.value += 1
}

let answer = ref('')
async function checkAnswer() {
	if (answer.value.toLowerCase() === solution.value.toLowerCase()) {
		console.debug(ipa.value)
		await nextTick()
		alert('You win!')
	}
}

let difficulty = ref(0)
</script>

<template>
	<header>
		<h1 style="display: inline-block">Sound Bites</h1>
		<span class="days">
			<a
				v-for="(day, i) in days"
				:key="i"
				tabindex="0"
				:href="day.url"
				:class="{ day: true, active: activeDay === i + 1 }"
				@click.prevent="activeDay = i + 1"
			>
				{{ day.name }}
			</a>
		</span>
		<span class="difficulty">
			<label>
				<input type="radio" name="difficulty" v-model="difficulty" :value="0" />
				hard
			</label>
			<label>
				<input type="radio" name="difficulty" v-model="difficulty" :value="1" />
				easy
			</label>
		</span>
	</header>

	<main>
		<div
			class="bites"
			@keyup.up="selectedWordIndex -= 1"
			@keyup.down="selectedWordIndex += 1"
			@keyup.enter="selectedWordIndex += 1"
			@keyup.left="selectedLetterIndex -= 1"
			@keyup.right="selectedLetterIndex += 1"
			@keyup.delete="handleDelete"
			@keyup="handleInput"
		>
			<SoundBite
				v-for="([clue, answer, bites], index) in clues"
				ref="clueEls"
				:key="index"
				:clue="clue[difficulty]"
				:answer="answer"
				:bites="bites"
				:guess="hooks[index]"
				:selected="selectedWordIndex === index"
				:selected-letter-index="selectedLetterIndex"
				@select-word="selectedWordIndex = index"
				@select-letter="(index) => (selectedLetterIndex = index)"
				autofocus="true"
				:padding="longest"
			/>
		</div>

		<div class="final">
			<div class="clue">
				<span
					class="bite"
					v-for="(letter, index) in clues
						.map(([, , bites], index) => {
							if (hooks[index].join('') === answers[index])
								return hooks[index].slice(bites[0], bites[1]).join('')
							else return new Array(bites[1] - bites[0]).fill(' ').join('')
						})
						.join('')"
					:key="index"
					>{{ letter }}</span
				>
				<span
					v-for="i in longest - bites"
					:key="i"
					class="bite blank"
					aria-role="presentation"
				>
				</span>
			</div>
			<input v-model="answer" @input="checkAnswer" class="answer" />
		</div>
	</main>
</template>

<style scoped>
/* todo: make letters not change size when they are filled in */
main {
	margin-top: 1rem;
	display: flex;
	flex-wrap: wrap;
	gap: 5rem 2.5rem;
}
.final {
	/* flex-grow: 1; */
	/* flex-shrink: 0; */
	margin-left: auto;
	max-width: 100%;
	flex: 1;
}

.bites {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 1.2rem;
	/* margin-right: auto; */
}

.clue {
	display: flex;
	gap: 0.2rem;
	margin-right: auto;
	max-width: 100%;
}

.bite {
	border: 2px solid var(--color-text);
	flex-basis: 3rem;
	aspect-ratio: 1;
	border-radius: 50%;
	text-transform: uppercase;
	line-height: 1;
	align-content: center;
	padding: 0 0.4em;
	font-size: 2rem;

	&.blank {
		visibility: hidden;
	}
}

.answer {
	text-align: center;
	text-transform: uppercase;
	font-size: min(10vw, 2rem);
	width: 9em;
	max-width: 100%;
	margin-top: 1.5rem;
	border: 2px solid var(--color-text);
	background: var(--color-background);
	color: var(--color-foreground);
}

.answer:focus-visible {
	border-radius: 1px;
	outline: 2px solid var(--color--accent);
	outline-offset: 2px;
}

.days {
	display: inline-flex;
	gap: 0.7em;
}
</style>
