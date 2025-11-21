
let wordsArray = [];
let originalPositions = new Map();
let block3Color = null;

function parseWords() {
    const input = document.getElementById('textInput').value;
    const words = input.split('-').filter(word => word.trim() !== '');
    
    document.getElementById('block2').innerHTML = '';
    document.getElementById('block3').innerHTML = '';
    document.getElementById('wordsOutput').innerHTML = '';
    
    const sortedWords = sortWords(words);
    wordsArray = sortedWords;
    originalPositions.clear();
    block3Color = null;
    
    const block2 = document.getElementById('block2');
    sortedWords.forEach((wordObj, index) => {
        const wordElement = createWordElement(wordObj, index);
        block2.appendChild(wordElement);
        originalPositions.set(wordObj.key, {
            element: wordElement,
            index: index
        });
    });
}

function sortWords(words) {
    const lowercaseWords = [];
    const uppercaseWords = [];
    const numbers = [];
    
    words.forEach(word => {
        const trimmedWord = word.trim();
        if (!trimmedWord) return;
        
        if (/^\d+$/.test(trimmedWord)) {
            numbers.push({
                type: 'number',
                value: parseInt(trimmedWord),
                display: trimmedWord
            });
        } 
        else if (/^[А-Я]/.test(trimmedWord)) {
            uppercaseWords.push({
                type: 'uppercase',
                value: trimmedWord.toLowerCase(),
                display: trimmedWord
            });
        }
        else {
            lowercaseWords.push({
                type: 'lowercase', 
                value: trimmedWord.toLowerCase(),
                display: trimmedWord
            });
        }
    });
    
    lowercaseWords.sort((a, b) => a.value.localeCompare(b.value, 'ru'));
    uppercaseWords.sort((a, b) => a.value.localeCompare(b.value, 'ru'));
    numbers.sort((a, b) => a.value - b.value);
    
    lowercaseWords.forEach((item, index) => {
        item.key = 'a' + (index + 1);
    });
    uppercaseWords.forEach((item, index) => {
        item.key = 'b' + (index + 1);
    });
    numbers.forEach((item, index) => {
        item.key = 'n' + (index + 1);
    });
    
    return [...lowercaseWords, ...uppercaseWords, ...numbers];
}

function createWordElement(wordObj, index) {
    const element = document.createElement('div');
    element.className = 'word-item';
    element.textContent = `${wordObj.key}: ${wordObj.display}`;
    element.draggable = true;
    element.dataset.key = wordObj.key;
    element.dataset.word = wordObj.display;
    
    // Случайный цвет
    const randomColor = `hsl(${Math.random() * 360}, 70%, 65%)`;
    element.style.backgroundColor = randomColor;
    
    element.addEventListener('dragstart', dragStart);
    element.addEventListener('click', function(event) {
        if (this.parentElement.id === 'block3') {
            addWordToOutput(this.dataset.word);
        }
    });
    
    return element;
}

function addWordToOutput(word) {
    const output = document.getElementById('wordsOutput');
    const wordSpan = document.createElement('span');
    wordSpan.className = 'output-word';
    wordSpan.textContent = word;
    output.appendChild(wordSpan);
}

function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.key);
    event.target.classList.add('dragging');
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const key = event.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`[data-key="${key}"]`);
    
    if (draggedElement && event.target.id === 'block3') {
        // Устанавливаем общий цвет для всех элементов в блоке 3
        if (!block3Color) {
            block3Color = `hsl(${Math.random() * 360}, 70%, 65%)`;
        }
        draggedElement.style.backgroundColor = block3Color;
        
        event.target.appendChild(draggedElement);
        draggedElement.classList.remove('dragging');
    }
}

function dropBack(event) {
    event.preventDefault();
    const key = event.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`[data-key="${key}"]`);
    
    if (draggedElement && event.target.id === 'block2') {
        const originalPosition = originalPositions.get(key);
        if (originalPosition) {
            // Восстанавливаем оригинальный цвет
            const randomColor = `hsl(${Math.random() * 360}, 70%, 65%)`;
            draggedElement.style.backgroundColor = randomColor;
            
            // Вставляем на оригинальную позицию
            const block2 = document.getElementById('block2');
            const children = Array.from(block2.children).filter(child => child.classList.contains('word-item'));
            
            if (originalPosition.index >= children.length) {
                block2.appendChild(draggedElement);
            } else {
                block2.insertBefore(draggedElement, children[originalPosition.index]);
            }
            
            draggedElement.classList.remove('dragging');
        }
    }
}

document.getElementById('textInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        parseWords();
    }
});
