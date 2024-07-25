<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import SoundBite from './components/SoundBite.vue'

const CLUE_INDEX = 0
const ANSWER_INDEX = 1
const BITE_ARGS = 2 // the ".slice" args for the answer's substring that is the sound bite

let clues = [
	['folksy medicine accompaniment', 'sugar', [0, 2]],
	['discreet', 'careful', [5, 6]],
	['teach', 'school', [1, 3]],
]

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

watch(selectedLetterIndex, (index) => {
	if (index < 0) selectedLetterIndex.value = selectedWord.value.length - 1
	if (index >= selectedWord.value.length) selectedLetterIndex.value = 0
	if (index === 0 && !selectedGuess.value.some((char) => char === ' ')) {
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
</script>

<template>
	<header>
		<h1>Sound Bites</h1>
	</header>

	<main
		autofocus
		tabindex="0"
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
		/>
	</main>
</template>

<style scoped></style>
