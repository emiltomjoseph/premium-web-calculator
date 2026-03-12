class Calculator {
    constructor(expressionElement, resultElement) {
        this.expressionElement = expressionElement;
        this.resultElement = resultElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.operation = undefined;
        this.expressionElement.innerText = '';
        this.resultElement.innerText = '0';
    }

    delete() {
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') {
            this.resultElement.innerText = '0';
        } else {
            this.resultElement.innerText = this.formatNumber(this.currentOperand);
        }
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand.length > 15) return; // Limit length
        this.currentOperand = this.currentOperand.toString() + number.toString();
        this.resultElement.innerText = this.formatNumber(this.currentOperand);
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.calculate();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.updateDisplay();
    }

    calculate() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.resultElement.innerText = "Error";
                    this.currentOperand = '';
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Handle floating point precision issues
        computation = Math.round(computation * 100000000) / 100000000;
        
        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
        this.resultElement.innerText = this.formatNumber(computation);
        this.expressionElement.innerText = '';
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    formatNumber(num) {
        if (num === '' || num === undefined) return '0';
        // Check for error state
        if (num === 'Error') return num;
        
        const stringNum = num.toString();
        if (stringNum.includes('.')) {
            const parts = stringNum.split('.');
            return parseFloat(parts[0]).toLocaleString() + '.' + parts[1];
        }
        return parseFloat(stringNum).toLocaleString();
    }

    updateDisplay() {
        if (this.operation != null) {
            this.expressionElement.innerText = `${this.formatNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.expressionElement.innerText = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const expressionElement = document.getElementById('expression');
    const resultElement = document.getElementById('result');
    const calculator = new Calculator(expressionElement, resultElement);

    const keys = document.querySelectorAll('.key');

    keys.forEach(key => {
        key.addEventListener('click', () => {
            const action = key.dataset.action;
            const num = key.dataset.num;

            if (num !== undefined) {
                calculator.appendNumber(num);
            } else if (action === 'clear') {
                calculator.clear();
            } else if (action === 'delete') {
                calculator.delete();
            } else if (action === 'calculate') {
                calculator.calculate();
            } else if (action === 'percent') {
                 // Simple percent behavior: divide current number by 100
                 if (calculator.currentOperand !== '') {
                     calculator.currentOperand = parseFloat(calculator.currentOperand) / 100;
                     resultElement.innerText = calculator.formatNumber(calculator.currentOperand);
                 }
            } else {
                // Operators
                let op = key.innerText;
                if (action === 'multiply') op = '*';
                if (action === 'divide') op = '÷';
                if (action === 'add') op = '+';
                if (action === 'subtract') op = '-';
                
                calculator.chooseOperation(op);
            }
        });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if ((e.key >= 0 && e.key <= 9) || e.key === '.') {
            calculator.appendNumber(e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault(); // Prevent form submission if in form
            calculator.calculate();
        } else if (e.key === 'Backspace') {
            calculator.delete();
        } else if (e.key === 'Escape') {
            calculator.clear();
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            let op = e.key;
            if (op === '/') op = '÷'; // Display symbol mapping
            calculator.chooseOperation(op);
        }
    });

    // Theme Switcher Logic
    const themeBtns = document.querySelectorAll('.theme-btn');
    
    // Load saved theme
    const savedTheme = localStorage.getItem('calculator-theme') || 'midnight';
    setTheme(savedTheme);

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            setTheme(theme);
        });
    });

    function setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        
        // Update active button state
        themeBtns.forEach(btn => {
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Save preference
        localStorage.setItem('calculator-theme', theme);
    }
});
