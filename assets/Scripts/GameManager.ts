import { _decorator, Component, Node } from 'cc';
import { MenuControler } from './MenuControler';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    public static Level = [`A1`, `A2`, `B1`, `B2`, `C1`, `C2`];

    public static data = {
        "themeConfig": {
            "title_game": "",
            "logo_main": "",
            "background": "",
            "theme": "",
            "icon": "",
        },
        "topic": "Jobs",
        "subTopics": [
            "Wild Animals",
            "Domestic Animals"
        ],
        "description": "Find and connect words related to animals in the word grid.",
        "level": "Beginner",
        "options": {
            "isCountdownMode": false,
            "timeLimit": 180,
            "bonusScore": 10
        },
        "config": {
            "grammar_skill_percent": 0,
            "listening_skill_percent": 16,
            "mastery_threshold": 70,
            "max_gain": 1,
            "passing_score": 60,
            "reading_skill_percent": 16,
            "speaking_skill_percent": 16,
            "vocabulary_skill_percent": 0,
            "writing_skill_percent": 16,
            "Name": "SeaS maxWidth /"
        },
        "questions": [
            {
                "matrixKey": [
                    ["T", "S", "L", "Z", "Y", "M", "R", "P"],
                    ["O", "T", "A", "A", "L", "P", "B", "O"],
                    ["F", "U", "D", "C", "Y", "R", "G", "L"],
                    ["A", "D", "R", "B", "T", "F", "P", "I"],
                    ["R", "E", "I", "H", "M", "O", "K", "C"],
                    ["M", "N", "V", "D", "N", "K", "R", "E"],
                    ["E", "T", "E", "P", "C", "E", "S", "V"],
                    ["R", "E", "R", "P", "K", "Z", "G", "Z"]
                ],
                "answers": [
                    {
                        "value": "ARchAEOLOGIST",
                        "hint": "",
                        "image": "",
                        "isHide": true
                    },
                    {
                        "value": "FARMER",
                        "hint": "",
                        "image": "",
                        "isHide": true
                    },
                    {
                        "value": "POLICE",
                        "hint": "Keeps people safe and catches criminals",
                        "image": "",
                        "isHide": false
                    },
                    {
                        "value": "ACTOR",
                        "hint": "",
                        "image": "",
                        "isHide": false
                    },
                    {
                        "value": "DRIVER",
                        "hint": "",
                        "image": "",
                        "isHide": false
                    }
                ]
            },
            {
                "matrixKey": [
                    ["D", "O", "C", "T", "O", "R", "U", "K"],
                    ["X", "B", "E", "J", "M", "R", "R", "T"],
                    ["H", "T", "U", "W", "E", "E", "P", "E"],
                    ["G", "L", "X", "C", "G", "Y", "O", "A"],
                    ["F", "J", "N", "N", "P", "R", "L", "C"],
                    ["G", "A", "I", "T", "F", "L", "I", "H"],
                    ["D", "S", "Y", "X", "F", "Y", "C", "E"],
                    ["P", "J", "O", "O", "N", "W", "E", "R"]
                ],
                "answers": [
                    {
                        "value": "TEACHER",
                        "hint": "Works at school and helps students learn",
                        "image": "",
                        "isHide": true
                    },
                    {
                        "value": "DOCTOR",
                        "hint": "Helps sick people get better",
                        "image": "",
                        "isHide": false
                    },
                    {
                        "value": "DANCER",
                        "hint": "",
                        "image": "",
                        "isHide": true
                    },
                    {
                        "value": "SINGER",
                        "hint": "",
                        "image": "",
                        "isHide": false
                    },
                    {
                        "value": "POLICE",
                        "hint": "Keeps people safe and catches criminals",
                        "image": "",
                        "isHide": false
                    }
                ]
            },
            {
                "matrixKey": [
                    ["V", "F", "O", "Z", "G", "W", "S", "Q"],
                    ["S", "I", "N", "G", "E", "R", "T", "N"],
                    ["N", "V", "R", "H", "F", "S", "U", "U"],
                    ["P", "O", "L", "I", "C", "E", "D", "R"],
                    ["P", "Q", "P", "N", "Z", "Q", "E", "S"],
                    ["A", "C", "T", "O", "R", "U", "N", "E"],
                    ["H", "I", "W", "M", "U", "W", "T", "Y"],
                    ["E", "F", "Z", "F", "T", "Z", "P", "E"]
                ],
                "answers": [
                    {
                        "value": "POLICE",
                        "hint": "Keeps people safe and catches criminals",
                        "image": "",
                        "isHide": false
                    },
                    {
                        "value": "NURSE",
                        "hint": "Assists doctors and cares for patients",
                        "image": "",
                        "isHide": false
                    },
                    {
                        "value": "ACTOR",
                        "hint": "",
                        "image": "",
                        "isHide": false
                    },
                    {
                        "value": "STUDENT",
                        "hint": "Learns at school or college",
                        "image": "",
                        "isHide": true
                    },
                    {
                        "value": "SINGER",
                        "hint": "",
                        "image": "",
                        "isHide": false
                    }
                ]
            }
        ]
    };

    public static answersFakeData = [
        { value: "TEACHER", hint: "Works at school and helps students learn", image: "", isHide: true },
        { value: "DOCTOR", hint: "Helps sick people get better", image: "", isHide: false },
        { value: "NURSE", hint: "Assists doctors and cares for patients", image: "", isHide: false },
        { value: "POLICE", hint: "Keeps people safe and catches criminals", image: "", isHide: false },
        { value: "STUDENT", hint: "Learns at school or college", image: "", isHide: true },
        { value: "DRIVER", hint: "", image: "", isHide: false },
        { value: "FARMER", hint: "", image: "", isHide: true },
        { value: "CHEF", hint: "", image: "", isHide: false },
        { value: "WAITER", hint: "", image: "", isHide: false },
        { value: "SINGER", hint: "", image: "", isHide: false },
        { value: "DANCER", hint: "", image: "", isHide: true },
        { value: "ACTOR", hint: "", image: "", isHide: false },
        { value: "ARTIST", hint: "", image: "", isHide: true },
        { value: "CLEANER", hint: "", image: "", isHide: false },
        { value: "PILOT", hint: "Flies airplanes", image: "", isHide: true },
        { value: "BAKER", hint: "Makes bread and cakes", image: "", isHide: false },
        { value: "DENTIST", hint: "Takes care of people's teeth", image: "", isHide: true },
        { value: "BUILDER", hint: "Builds houses and buildings", image: "", isHide: false },
        { value: "FIREMAN", hint: "Stops fires and saves people", image: "", isHide: false },
        { value: "CASHIER", hint: "Takes money in a shop", image: "", isHide: true }
    ]


    /**
     * Lấy ngẫu nhiên một bộ từ theo chủ đề
     * @returns Bộ từ ngẫu nhiên hoặc null nếu không tìm thấy chủ đề
     */
    public static getRandomWordSet(index: number) {
        console.log("selectedAnswers", this.answersFakeData)
        if (!this.answersFakeData || this.answersFakeData.length < 5) return;
        const shuffled = [...this.answersFakeData].sort(() => Math.random() - 0.5);
        const selectedAnswers = shuffled.slice(0, 5);
        this.data.questions[index].answers = selectedAnswers;
    }

    /**
     * Tạo ma trận từ mảng các từ cho trước
     * @param words Mảng các từ cần đặt vào ma trận
     * @param size Kích thước ma trận (mặc định là 10x10)
     * @returns Ma trận ký tự
     */
    public static generateMatrix(answers: any[], size: number = 8) {
        // Xử lý các từ có khoảng trắng
        const processedWords = answers.map(word => word.replace(/\s+/g, ''));
        const cloneAnswers = [...processedWords];
        cloneAnswers.sort((a, b) => b.length - a.length);
        size = Math.max(size, cloneAnswers[0].length);
        console.log("processed: ", processedWords, cloneAnswers[0]);

        // Khởi tạo ma trận rỗng
        const matrix: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));

        // Hàm kiểm tra vị trí có thể đặt từ
        const canPlaceWord = (word: string, row: number, col: number, direction: number[]): boolean => {
            const [dr, dc] = direction;
            for (let i = 0; i < word.length; i++) {
                const newRow = row + i * dr;
                const newCol = col + i * dc;
                if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) return false;
                if (matrix[newRow][newCol] !== '' && matrix[newRow][newCol] !== word[i]) return false;
            }
            return true;
        };

        // Hàm đặt từ vào ma trận
        const placeWord = (word: string, row: number, col: number, direction: number[]): void => {
            const [dr, dc] = direction;
            for (let i = 0; i < word.length; i++) {
                matrix[row + i * dr][col + i * dc] = word[i];
            }
            console.log(`Đặt từ ${word} theo hướng [${col},${row}]`);
        };

        // Các hướng có thể đặt từ (ngang, dọc, chéo)
        const directions = [
            [0, 1],   // ngang phải
            [1, 0],   // dọc xuống
            [1, 1],   // chéo phải xuống
            [-1, 1],   // chéo phải lên
            // [0, -1],   // ngang trái
            // [-1, 0],   // dọc lên
            // [-1, -1],   // chéo trái xuống
            // [1, -1],   // chéo trái lên
        ];

        // Đặt các từ vào ma trận
        for (const wordRaw of processedWords) {
            const word = wordRaw.toUpperCase();
            let placed = false;
            let attempts = 0;
            const maxAttempts = 200;

            while (!placed && attempts < maxAttempts) {
                const direction = directions[Math.floor(Math.random() * directions.length)];
                const row = Math.floor(Math.random() * size);
                const col = Math.floor(Math.random() * size);

                if (canPlaceWord(word, row, col, direction)) {
                    placeWord(word, row, col, direction);
                    placed = true;
                }
                attempts++;
            }
        }

        // Điền các ô trống bằng ký tự ngẫu nhiên
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (matrix[i][j] === '') {
                    matrix[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
                }
            }
        }

        return matrix;
        // this.data.matrixKey = matrix;
    }
}


