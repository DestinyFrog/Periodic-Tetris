(async () => {
    const resp = await fetch("./atoms.json");
    const elements = (await resp.json()).map((element) => {
        return {
            ...element,
            get cor() {
                switch (this["categoria"]) {
                    case "hidrogênio":
                        return "#aaaaff";
                    case "metal alcalino":
                        return "#dcdc00";
                    case "metal alcalino terroso":
                        return "#ff2200";
                    case "ametal":
                        return "#00dd00";
                    case "metal de transição":
                        return "#ff0000";
                    case "gás nobre":
                        return "#aa00aa";
                    case "outros metais":
                        return "#00aaee";
                    case "metaloide":
                        return "#ff22ee";
                    case "halogênio":
                        return "#00aaee";
                    case "desconhecido":
                    default:
                        return "#444444";
                }
            },
        };
    });

    const main = document.getElementById("main");
    const canvas = document.createElement("canvas");
    canvas.id = "canvas";
    main.appendChild(canvas);

    const elementLog = document.createElement("div");
    elementLog.id = "element";
    main.appendChild(elementLog);

    const pointLog = document.createElement("p");
	pointLog.id = "element-point";
    elementLog.appendChild(pointLog);

    const symbolLog = document.createElement("h1");
	symbolLog.id = "element-symbol"
    elementLog.appendChild(symbolLog);

    const ctx = canvas.getContext("2d");

    const UNIT = 28;
    const COLS = 9;
    const ROWS = 20;
    const DELAY = 150;

    let points = {
        _value: 0,

        set value(v) {
            this._value = v;
            if (this._value != 0 || this._value >= elements.length) {
                pointLog.textContent = this._value;
                symbolLog.textContent = elements[this._value-1].simbolo;
                elementLog.style.backgroundColor = elements[this._value-1].cor;
            } else {
				pointLog.textContent = '';
                symbolLog.textContent = this._value;
            }
        },
    };

    const WIDTH = COLS * UNIT;
    const HEIGHT = ROWS * UNIT;

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    let elementsIdx = 0;
    let blocks = [];

    function resetBlocks() {
        blocks = [];
        for (let i = 0; i < ROWS; i++) {
            blocks.push([]);
            for (let j = 0; j < COLS; j++) {
                blocks[i].push(null);
            }
        }
        points.value = 0;
    }

    let forms = [
        [
            { x: 1, y: 0 },
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: -1, y: 1 },
        ],
        [
            { x: 1, y: 0 },
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
        ],
        [
            { x: 1, y: 0 },
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: -2, y: 0 },
        ],
        [
            { x: 1, y: -1 },
            { x: 0, y: -1 },
            { x: 0, y: 0 },
            { x: -1, y: 0 },
        ],
        [
            { x: -1, y: 1 },
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
        ],
    ];

    let player = {
        x: Math.floor(COLS / 2),
        y: 0,
        blocks: [],
    };

    document.body.addEventListener("keydown", (ev) => {
        switch (ev.keyCode) {
            case 37: // Left
                player.x--;
                break;

            case 39: // Right
                player.x++;
                break;

            case 38: // Up
                player.blocks = player.blocks.map((block) => {
                    return {
                        ...block,
                        x: block.y * -1,
                        y: block.x * (block.x == 0 ? -1 : 1),
                    };
                });
                break;
        }
    });

    function init() {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "15px Arial";

        points.value = 0;

        playerReset();
        resetBlocks();

        requestAnimationFrame(() => loop());
    }

    function loop() {
        update();
        draw();

        setTimeout(() => {
            requestAnimationFrame(() => loop());
        }, DELAY);
    }

    function update() {
        if (playerCollideBlock()) {
            player.blocks.forEach((block) => {
                blocks[player.y + block.y][player.x + block.x] = {
                    color: block.color,
                    symbol: block.symbol,
                };
            });

            playerReset();
        }

        player.y++;
    }

    function draw() {
        ctx.fillStyle = "#000";
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        ctx.strokeStyle = "#aaa";

        for (let i = 1; i < ROWS; i++) {
            ctx.moveTo(0, i * UNIT);
            ctx.lineTo(WIDTH, i * UNIT);
        }

        for (let i = 1; i < COLS; i++) {
            ctx.moveTo(i * UNIT, 0);
            ctx.lineTo(i * UNIT, HEIGHT);
        }

        ctx.stroke();

        player.blocks.forEach((block) => {
            ctx.fillStyle = block.color;

            const x = (player.x + block.x) * UNIT;
            const y = (player.y + block.y) * UNIT;

            ctx.fillRect(x + 1, y + 1, UNIT - 2, UNIT - 2);

            ctx.fillStyle = "#ffffff";
            ctx.fillText(block.symbol, x + UNIT / 2, y + UNIT / 2);
        });

        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                const block = blocks[i][j];
                if (block) {
                    ctx.fillStyle = block.color;

                    const x = j * UNIT;
                    const y = i * UNIT;

                    ctx.fillRect(x + 1, y + 1, UNIT - 2, UNIT - 2);

                    ctx.fillStyle = "#ffffff";
                    ctx.fillText(block.symbol, x + UNIT / 2, y + UNIT / 2);
                }
            }
        }
    }

    function playerCollideBlock() {
        for (let i = 0; i < player.blocks.length; i++) {
            if (
                player.y + player.blocks[i].y + 1 == ROWS ||
                blocks[player.y + player.blocks[i].y + 1][
                    player.x + player.blocks[i].x
                ]
            )
                return true;
        }

        return false;
    }

    function playerReset() {
        if (player.y < 3) resetBlocks();

        (player.x = Math.floor(COLS / 2)), (player.y = 0);

        player.blocks = forms[Math.floor(Math.random() * forms.length)].map(
            (block) => {
                const obj = {
                    ...block,
                    color: elements[elementsIdx].cor,
                    symbol: elements[elementsIdx]["simbolo"],
                };
                elementsIdx++;
                if (elementsIdx >= elements.length) elementsIdx = 0;
                return obj;
            }
        );

        for (let i = 0; i < ROWS; i++) {
            if (
                blocks[i].reduce(
                    (prev, x) => (x != null ? prev + 1 : prev),
                    0
                ) >= COLS
            ) {
                points.value = points._value + 1;
                for (let j = i; j >= 1; j--) {
                    blocks[j] = [...blocks[j - 1]];
                }
            }
        }
    }

    init();
}).call(this);
