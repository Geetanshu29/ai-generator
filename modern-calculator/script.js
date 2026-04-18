const buttons = document.querySelectorAll('.btn');
const display = document.querySelector('.display');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const btnText = button.textContent;
        if (btnText === '=') {
            display.value = eval(display.value);
        } else if (btnText === 'C') {
            display.value = '';
        } else {
            display.value += btnText;
        }
    });
});