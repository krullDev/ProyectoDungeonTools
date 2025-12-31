"use strict";

window.onkeydown = function (e) {
    if (e.code === "Enter") {
        const rollBtn = document.getElementById("rollBtn");
        if (rollBtn) rollBtn.click();
    }
};

var main = (function () {
    var that = {};
    var elem = {};
    var box = null;

    that.init = function () {
        elem.container = $t.id("diceRoller");
        elem.result = $t.id("result");
        elem.textInput = $t.id("textInput");
        elem.instructions = $t.id("instructions");

        box = new DICE.dice_box(elem.container);

        // Actualiza dados al escribir
        $t.bind(elem.textInput, "input", function () {
            box.setDice(elem.textInput.value);
        });

        box.setDice(elem.textInput.value || "");
        show_instructions(true);

        // BOTÓN ROLL
        const rollBtn = $t.id("rollBtn");
        if (rollBtn) {
            $t.bind(rollBtn, "click", function () {
                that.setInput();

                box.start_throw(before_roll, after_roll);
            });
        }
    };

    that.setInput = function () {
        let inputVal = elem.textInput.value;

        const bonusInput = document.getElementById("bonusInput");
        let bonus = 0;

        if (bonusInput && bonusInput.value.trim() !== "") {
            bonus = parseInt(bonusInput.value, 10) || 0;
        }

        if (bonus !== 0) {
            inputVal += bonus > 0 ? `+${bonus}` : bonus;
        }

        box.setDice(inputVal);
        show_instructions(false);
    };

    function show_instructions(show) {
        if (!elem.instructions) return;
        elem.instructions.style.display = show ? "block" : "none";
    }

    /* CALLBACKS DEL MOTOR */

    function before_roll() {
        elem.result.innerHTML = "";
        const diceLog = document.getElementById("dice-log");
        if (diceLog) diceLog.textContent = "Tirando dados…";
        return null;
    }

    function after_roll(notation) {
        if (!notation || !notation.result || notation.result[0] < 0) {
            elem.result.innerHTML = "Oops, los dados se salieron.";
            return;
        }

        // Resultado del motor
        elem.result.innerHTML = notation.resultString;

        // ---- CINTA DE TEXTO ----
        const diceLog = document.getElementById("dice-log");
        const bonusInput = document.getElementById("bonusInput");

        const rolls = notation.result; // ej: [3,4,6]
        const diceSum = rolls.reduce((a, b) => a + b, 0);

        let bonus = 0;
        if (bonusInput && bonusInput.value.trim() !== "") {
            bonus = parseInt(bonusInput.value, 10) || 0;
        }

        const total = diceSum + bonus;

        let text = rolls.join(" + ");

        if (bonus !== 0) {
            text += bonus > 0 ? ` + ${bonus}` : ` - ${Math.abs(bonus)}`;
        }

        text += ` = ${total}`;

        if (diceLog) {
            diceLog.textContent = text;
        }
    }

    return that;
})();