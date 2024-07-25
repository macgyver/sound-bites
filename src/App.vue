<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import SoundBite from './components/SoundBite.vue'

const CLUE_INDEX = 0
const ANSWER_INDEX = 1
const BITE_ARGS = 2 // the ".slice" args for the answer's substring that is the sound bite

// this will come from server or something
let data = [
	['folksy medicine accompaniment', 'sugar', [0, 1]],
	['discreet', 'careful', [5, 6]],
	['teach', 'school', [1, 3]],
	['ʃʊk', 'shook'],
]

let clues = data.slice(0, -1)

let [ipa, solution] = data.at(-1)

let guesses = reactive(
	clues.map(([, answer]) => new Array(answer.length).fill(' ')),
)

let selectedGuess = computed(() => guesses[selectedWordIndex.value])

let clueEls = ref([])

let selectedWordIndex = ref(0)
let selectedLetterIndex = ref(0)

watch(selectedWordIndex, (index) => {
	if (index < 0) selectedWordIndex.value = clues.length - 1
	if (index >= clues.length) selectedWordIndex.value = 0
	selectedLetterIndex.value =
		selectedGuess.value.findIndex((letter) => letter === ' ') || 0
})
let selectedWord = computed(() => clues[selectedWordIndex.value][ANSWER_INDEX])

watch(selectedLetterIndex, (index, oldIndex) => {
	if (index < 0) selectedLetterIndex.value = selectedWord.value.length - 1
	if (index >= selectedWord.value.length) selectedLetterIndex.value = 0
	if (
		index === 0 &&
		oldIndex !== 1 &&
		!selectedGuess.value.some((char) => char === ' ')
	) {
		// let nextIncompleteWordIndex =
		// todo: advance to the next blank space in the next word, if there is one, or to the final input if not
		selectedWordIndex.value += 1
	}
})

function handleDelete() {
	if (
		selectedLetterIndex.value > 0 &&
		selectedGuess.value[selectedLetterIndex.value] === ' '
	) {
		// they probably wanted to delete the previous letter
		selectedGuess.value.splice(selectedLetterIndex.value - 1, 1, ' ')
		selectedLetterIndex.value -= 1
	} else {
		// delete the current letter and stay where we are.
		guesses[selectedWordIndex.value].splice(selectedLetterIndex.value, 1, ' ')
	}
}

function handleInput(e) {
	if (e.keyCode < 65 || !/\p{L}/u.test(e.key)) return
	guesses[selectedWordIndex.value].splice(selectedLetterIndex.value, 1, e.key)
	selectedLetterIndex.value += 1
}

let answer = ref('')
function checkAnswer() {
	if (answer.value.toLowerCase() === solution.toLowerCase()) {
		console.debug(ipa)
		setTimeout(() => {
			alert('You win!')
		}, 0)
	}
}
</script>

<template>
	<header>
		<h1>Sound Bites</h1>
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
				:clue="clue"
				:answer="answer"
				:bites="bites"
				:guess="guesses[index]"
				:selected="selectedWordIndex === index"
				:selected-letter-index="selectedLetterIndex"
				@select-word="selectedWordIndex = index"
				@select-letter="(index) => (selectedLetterIndex = index)"
				autofocus="true"
			/>
		</div>

		<div class="final">
			<div class="clue">
				<span
					class="bite"
					v-for="(letter, index) in clues
						.map(([, , bites], index) =>
							guesses[index].slice(bites[0], bites[1]).join(''),
						)
						.join('')"
					:key="index"
					>{{ letter }}</span
				>
			</div>
			<input v-model="answer" @input="checkAnswer" class="answer" />
		</div>
	</main>
</template>

<style scoped>
main {
	margin-top: 1rem;
	display: flex;
	flex-wrap: wrap;
	gap: 5rem 2.5rem;
}
.final {
	/* margin-top: 5em; */
	/* display: flex; */
	gap: 1.5rem;
}

.clue {
	display: flex;
	gap: 0.1em;
	margin-right: auto;
}

.bites {
	display: flex;
	flex-direction: column;
	gap: 1.2rem;
	margin-right: auto;
}

.bite {
	font-size: 2rem;
	border: 2px solid black;
	display: inline-block;
	height: 3rem;
	aspect-ratio: 1;
	border-radius: 50%;
	text-transform: uppercase;
	line-height: 1;
	align-content: center;
	padding: 0px 0.4em;
}

.answer {
	text-align: center;
	text-transform: uppercase;
	font-size: 2rem;
	width: 9em;
	margin-top: 1.5rem;
	border: 2px solid black;
}

.answer:focus-visible {
	border-radius: 1px;
	outline: 2px solid cyan;
	outline-offset: 2px;
}
</style>
