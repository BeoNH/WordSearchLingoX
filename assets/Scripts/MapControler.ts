import { _decorator, Color, Component, EventTouch, Input, input, instantiate, Label, Node, Prefab, Sprite, UITransform, Vec3, Graphics, tween, v3, assetManager, ImageAsset, SpriteFrame, Texture2D, Button } from 'cc';
import { GameManager } from './GameManager';
import { WordSearch } from './WordSearch';
import { UIControler } from './UIControler';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;


interface UsedFeatures {
    hints: Set<number>;
    sounds: Set<number>;
}

interface GridCell {
    node: Node;
    letter: string;
}

@ccclass('MapControler')
export class MapControler extends Component {

    @property({ readonly: true, editorOnly: true, serializable: false })
    private GRID: string = "========== GRID ELEMENTS ==========";
    @property({ type: Node, tooltip: "Node chứa toàn bộ lưới ô" })
    public wordGrid: Node = null;
    @property({ type: Prefab, tooltip: "Các ô trong lưới" })
    public letterCell: Prefab = null;
    @property({ type: Node, tooltip: "Node chứa các đường kéo" })
    public selectionLines: Node = null;

    @property({ readonly: true, editorOnly: true, serializable: false })
    private GAMEPLAY: string = "========= GAMEPLAY ELEMENTS ==========";
    @property({ type: Node, tooltip: "Các câu trả lời" })
    public answerList: Node = null;
    @property({ type: Prefab, tooltip: "Node hiển thị đáp án" })
    public answerCell: Prefab = null;
    @property({ type: Label, tooltip: "Hiện thị số đáp án đúng" })
    public lbCorrectAnswer: Label = null;
    @property({ type: Sprite, tooltip: "Ảnh đáp án được phóng to" })
    public imgZoomScale: Sprite = null;
    // @property({ type: Node, tooltip: "Node chứa các gợi ý từ khoá" })
    // public itemShowKeyList: Node = null;


    // Game State
    private grid: GridCell[][] = [];
    private selectedCells: GridCell[] = [];
    private usedFeatures: UsedFeatures = {
        hints: new Set<number>(),
        sounds: new Set<number>()
    };
    public wordAnswers: string[] = [];
    public discoveredWords: boolean[] = [];

    // Touch State
    private touchStartRow: number = -1;
    private touchStartCol: number = -1;
    private selectionDirection: string = null;
    private touchStartPosition: Vec3 = null;
    private selectionStep = 0;
    private activeSelectionLine: Node = null;
    private _eventListenersInitialized = false;



    initMap() {
        GameManager.getRandomWordSet();
        GameManager.generateMatrix();

        this.resetGameState();
        this.initializeData();
        this.setupUI();
        this.registerEvents();
    }



    //=============== BỘ DATA ĐẦU GẢME ===============//
    /**
     * Reset toàn bộ trạng thái game về mặc định
     * - Xóa timer và sự kiện
     * - Reset các biến trạng thái
     * - Reset giao diện
     */
    private resetGameState() {
        this.unregisterEvents();

        // Reset các biến trạng thái
        this.grid = [];
        this.selectedCells = [];
        this.wordAnswers = [];
        this.discoveredWords = [];
        this.touchStartRow = -1;
        this.touchStartCol = -1;
        this.selectionDirection = null;
        this.touchStartPosition = null;
        this.selectionStep = 0;
        this.activeSelectionLine = null;
        this._eventListenersInitialized = false;
        this.imgZoomScale.node.parent.active = false;
        WordSearch.Instance.waitMask.active = false;

        this.usedFeatures = {
            hints: new Set<number>(),
            sounds: new Set<number>()
        };

        // Reset giao diện
        if (this.wordGrid) this.wordGrid.removeAllChildren();
        if (this.selectionLines) this.selectionLines.children.forEach(line => line.active = false);
        if (this.answerList) this.answerList.children.forEach(child => {
            const label = child.getChildByPath('Label')?.getComponent(Label);
            if (label) label.string = '';
            child.active = false;
        });
    }

    /**
     * Khởi tạo dữ liệu game từ GameManager
     */
    private initializeData() {
        this.wordAnswers = [...GameManager.data.answers];
        this.discoveredWords = new Array(this.wordAnswers.length).fill(false);
    }

    /**
     * Thiết lập giao diện game
     */
    private setupUI() {
        this.wordGrid.removeAllChildren();
        this.selectionLines.children.forEach(line => line.active = false);
        this.initializeWordGrid();
        this.initializeAnswerDisplay();
        this.updateCorrectAnswer();
    }

    /**
     * Đăng ký các sự kiện touch
     */
    private registerEvents() {
        if (!this._eventListenersInitialized) {
            input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
            input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
            input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
            this._eventListenersInitialized = true;
        }
    }

    /**
    * Hủy đăng ký sự kiện touch
    */
    private unregisterEvents() {
        if (this._eventListenersInitialized) {
            input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
            input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
            input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
            this._eventListenersInitialized = false;
        }
    }


    //=============== KHỞI TẠO GIAO DIỆN ===============//
    /**
     * Khởi tạo lưới game
     * - Tạo các ô với ký tự từ data mẫu
     * - Thiết lập vị trí và style cho từng ô
     */
    private initializeWordGrid() {
        this.grid = GameManager.data.matrixKey.map(row => row.map(letter => ({
            node: instantiate(this.letterCell),
            letter: letter
        })));
        const cellSize = this.getCellSize();

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                let cellNode = this.grid[i][j].node;
                let label = cellNode.getChildByPath(`Label`).getComponent(Label);
                label.string = this.grid[i][j].letter;

                const offset = (this.grid.length * cellSize) / 2 - cellSize / 2;

                cellNode.name = `${cellNode.name}_${i}_${j}`;
                cellNode.parent = this.wordGrid;
                cellNode.setPosition(j * cellSize - offset, offset - i * cellSize);
                cellNode[`Key`] = this.grid[i][j].letter;
            }
        }
        this.adjustGridScale();
    }

    /**
     * Điều chỉnh tỷ lệ của lưới game
     * - Tính toán tỷ lệ dựa trên kích thước lưới
     * - Giảm tỷ lệ nếu lưới lớn hơn 10x10
     * - Áp dụng tỷ lệ cho lưới và đường kẻ
     */
    private adjustGridScale() {
        const gridSize = this.grid.length;
        let scale = 1;
        if (gridSize > 10) {
            scale = 1 - (gridSize - 10) * 0.06;
            if (scale < 0.5) scale = 0.5;
        }
        this.wordGrid.setScale(scale, scale, 1);
        this.selectionLines.setScale(scale, scale, 1);
    }

    /**
     * Khởi tạo các câu trả lời
     * - Tạo các node con chứa câu trả lời từ data mẫu
     * - Gán label và thuộc tính Answer cho từng node
     */
    private initializeAnswerDisplay() {
        const remCount = this.wordAnswers.length;
        const pool = this.answerList.children;
        for (let i = 0; i < remCount; i++) {
            let item: Node;
            if (i < pool.length) {
                item = pool[i];
            } else {
                item = instantiate(this.answerCell);
                item.parent = this.answerList;
            }
            let label = item.getChildByPath(`Label`).getComponent(Label);
            label.string = this.convertToUnderscore(this.wordAnswers[i]);
            label.color = new Color(80, 124, 181);
            item.active = true;

            let img = pool[i].getChildByPath(`Media/Img`);
            let sound = pool[i].getChildByPath(`Media/btnSound`);
            if (i == 0) {
                this.loadSpriteFrameFromUrl(`https://fastly.picsum.photos/id/177/2515/1830.jpg?hmac=G8-2Q3-YPB2TreOK-4ofcmS-z5F6chIA0GHYAe5yzDY`, sf => {
                    img.getComponent(Sprite).spriteFrame = sf;
                })
                img.off("click");
                img.on("click", () => this.zoomScaleImage(null, i));
            } else {
                img.active = false;
                sound.off("click");
                sound.on("click", () => this.onReadLetter(null, i));
            }
        }

        // Ẩn đi những item dư thừa
        for (let k = remCount; k < pool.length; k++) {
            pool[k].active = false;
        }
    }


    //=============== XỬ LÝ TƯƠNG TÁC NGƯỜI DÙNG ===============//
    /**
     * Xử lý khi người chơi bắt đầu chạm
     * - Lưu vị trí bắt đầu
     * - Bôi màu ô đầu tiên
     */
    onTouchStart(event: EventTouch) {
        let touchPos = event.getUILocation();
        let [row, col] = this.getGridCellAtPosition(new Vec3(touchPos.x, touchPos.y, 0));
        if (row >= 0 && col >= 0) {
            this.touchStartRow = row;
            this.touchStartCol = col;
            this.touchStartPosition = this.grid[row][col].node.getWorldPosition();

            this.activeSelectionLine = this.getUnusedSelectionLine();
            if (this.activeSelectionLine) {
                this.activeSelectionLine.setWorldPosition(this.touchStartPosition);
                this.selectionDirection = null;
            }
        }
    }

    /**
     * Xử lý khi người chơi kéo
     * - Xác định hướng kéo
     * - Vẽ đường kéo
     */
    onTouchMove(event: EventTouch) {
        if (this.touchStartRow < 0 || !this.activeSelectionLine) return;

        let touchPos = event.getUILocation();
        let currentPos = new Vec3(touchPos.x, touchPos.y, 0);

        let [row, col] = this.getGridCellAtPosition(currentPos);
        if (row < 0 || col < 0) return;

        let dx = col - this.touchStartCol;
        let dy = row - this.touchStartRow;
        let angle = 0;

        const cellSize = this.getCellSize();
        let lineLength = 0;

        // Chỉ cho phép di chuyển theo 8 hướng: ngang, dọc, chéo
        if (!((dx === 0 && dy !== 0) || (dy === 0 && dx !== 0) || (Math.abs(dx) === Math.abs(dy)))) {
            return;
        }

        this.selectionStep = Math.max(Math.abs(dx), Math.abs(dy));

        if (dx === 0 || dy === 0) {
            lineLength = this.selectionStep * cellSize + cellSize * 2 / 3;
        } else if (Math.abs(dx) === Math.abs(dy)) {
            lineLength = Math.sqrt(2) * this.selectionStep * cellSize + cellSize * 2 / 3;
        }

        let endpos = this.grid[row][col].node.getWorldPosition();
        let midPos = new Vec3(
            (this.touchStartPosition.x + endpos.x) / 2,
            (this.touchStartPosition.y + endpos.y) / 2,
            0
        );
        this.activeSelectionLine.setWorldPosition(midPos);

        if (dx === 0 && dy < 0) { this.selectionDirection = 'vertical-up'; angle = 90; }
        else if (dx === 0 && dy > 0) { this.selectionDirection = 'vertical-down'; angle = -90; }
        else if (dy === 0 && dx > 0) { this.selectionDirection = 'horizontal-right'; angle = 0; }
        else if (dy === 0 && dx < 0) { this.selectionDirection = 'horizontal-left'; angle = 180; }
        else if (dx > 0 && dy < 0) { this.selectionDirection = 'diagonal-up-right'; angle = 45; }
        else if (dx < 0 && dy < 0) { this.selectionDirection = 'diagonal-up-left'; angle = 135; }
        else if (dx > 0 && dy > 0) { this.selectionDirection = 'diagonal-down-right'; angle = -45; }
        else if (dx < 0 && dy > 0) { this.selectionDirection = 'diagonal-down-left'; angle = -135; }

        this.updateSelectionLine(this.activeSelectionLine, lineLength, angle);
    }

    /**
     * Xử lý khi người chơi thả tay
     * - Reset trạng thái chọn
     * - Xóa màu highlight và đường kéo
     */
    onTouchEnd(event: EventTouch) {
        this.selectedCells = [];
        if (this.selectionDirection && this.selectionStep > 0) {
            const len = this.grid.length;
            switch (this.selectionDirection) {
                case 'vertical-up':
                    for (let i = 0; i <= this.selectionStep; i++) {
                        let r = this.touchStartRow - i;
                        if (r >= 0 && r < len) {
                            this.selectedCells.push(this.grid[r][this.touchStartCol]);
                        }
                    }
                    break;
                case 'vertical-down':
                    for (let i = 0; i <= this.selectionStep; i++) {
                        let r = this.touchStartRow + i;
                        if (r >= 0 && r < len) {
                            this.selectedCells.push(this.grid[r][this.touchStartCol]);
                        }
                    }
                    break;
                case 'horizontal-right':
                    for (let i = 0; i <= this.selectionStep; i++) {
                        let c = this.touchStartCol + i;
                        if (c >= 0 && c < len) {
                            this.selectedCells.push(this.grid[this.touchStartRow][c]);
                        }
                    }
                    break;
                case 'horizontal-left':
                    for (let i = 0; i <= this.selectionStep; i++) {
                        let c = this.touchStartCol - i;
                        if (c >= 0 && c < len) {
                            this.selectedCells.push(this.grid[this.touchStartRow][c]);
                        }
                    }
                    break;
                case 'diagonal-up-right':
                    for (let i = 0; i <= this.selectionStep; i++) {
                        let r = this.touchStartRow - i;
                        let c = this.touchStartCol + i;
                        if (r >= 0 && r < len && c >= 0 && c < len) {
                            this.selectedCells.push(this.grid[r][c]);
                        }
                    }
                    break;
                case 'diagonal-up-left':
                    for (let i = 0; i <= this.selectionStep; i++) {
                        let r = this.touchStartRow - i;
                        let c = this.touchStartCol - i;
                        if (r >= 0 && r < len && c >= 0 && c < len) {
                            this.selectedCells.push(this.grid[r][c]);
                        }
                    }
                    break;
                case 'diagonal-down-right':
                    for (let i = 0; i <= this.selectionStep; i++) {
                        let r = this.touchStartRow + i;
                        let c = this.touchStartCol + i;
                        if (r >= 0 && r < len && c >= 0 && c < len) {
                            this.selectedCells.push(this.grid[r][c]);
                        }
                    }
                    break;
                case 'diagonal-down-left':
                    for (let i = 0; i <= this.selectionStep; i++) {
                        let r = this.touchStartRow + i;
                        let c = this.touchStartCol - i;
                        if (r >= 0 && r < len && c >= 0 && c < len) {
                            this.selectedCells.push(this.grid[r][c]);
                        }
                    }
                    break;
            }
        }
        if (this.activeSelectionLine) {
            this.activeSelectionLine.active = false;
        }
        this.checkSelectedWord();
        this.activeSelectionLine = null;
        this.resetEventTouch();
    }


    //=============== XỬ LÝ LOGIC GAME ===============//
    /**
     * Kiểm tra từ vừa kéo có khớp với đáp án không và cập nhật UI
     */
    checkSelectedWord(): void {
        if (!this.selectedCells.length) return;

        let forwardWord = '';
        for (let cell of this.selectedCells) {
            forwardWord += cell.letter;
        }

        let backwardWord = '';
        for (let i = this.selectedCells.length - 1; i >= 0; i--) {
            backwardWord += this.selectedCells[i].letter;
        }

        const formattedAnswers = this.wordAnswers.map(answer =>
            answer.toUpperCase().replace(/\s/g, '')
        );

        let checkWrong = true;
        for (let i = 0; i < formattedAnswers.length; i++) {
            if (this.discoveredWords[i]) continue;

            if (formattedAnswers[i] === forwardWord || formattedAnswers[i] === backwardWord) {
                this.activeSelectionLine.active = true;
                checkWrong = false;
                
                this.onReadWord(formattedAnswers[i]);
                if (!this.usedFeatures.sounds.has(i)) {
                    this.usedFeatures.sounds.add(i);
                    console.log(this.usedFeatures.sounds, i);
                }

                this.discoveredWords[i] = true;
                AudioController.Instance.Correct();
                WordSearch.Instance.updateScoreDisplay(GameManager.bonusScore);
                this.updateCorrectAnswer();

                this.showWordMoveEffect(this.selectedCells, i, () => {
                    if (this.discoveredWords.every(found => found)) {
                        AudioController.Instance.Clear();
                        this.endMap();
                    }
                });

                break;
            }
        }

        if(checkWrong && this.node.active){
            AudioController.Instance.timeOver_False();
        }
    }

    /**
     * Hiển thị tất cả đáp án chưa được tìm ra khi kết thúc game
     */
    private showAllAnswers(): void {
        for (let i = 0; i < this.wordAnswers.length; i++) {
            if (!this.discoveredWords[i]) {
                const answerLabel = this.answerList.children[i].getChildByPath('Label').getComponent(Label);
                answerLabel.string = this.wordAnswers[i];
                answerLabel.color = new Color(255, 80, 80);
            }
        }
    }

    /**
     * Cập nhật số câu hỏi đã trả lời đúng
     */
    private updateCorrectAnswer() {
        const correctCount = this.discoveredWords.filter(found => found).length;
        const totalCount = this.discoveredWords.length;
        this.lbCorrectAnswer.string = `Words: ${correctCount}/${totalCount}`;
    }


    //=============== XỬ LÝ ITEM HỖI TRỢ ===============//
    /**
     * Đọc đáp án trong ô chữ
     */
    onReadLetter(e, answerIndex: number) {
        // if (this.discoveredWords[answerIndex]) return;

        if (!this.usedFeatures.sounds.has(Number(answerIndex))) {
            // this.updateScore(GameManager.readScore);
            this.usedFeatures.sounds.add(Number(answerIndex));
        }

        const answer = this.wordAnswers[answerIndex];
        this.onReadWord(answer);
    }

    /**
     * Dùng API Google để đọc text
     */
    onReadWord(txt: string) {
        if (window.speechSynthesis) {
            const voices = window.speechSynthesis.getVoices();
            const msg = new SpeechSynthesisUtterance(txt);
            msg.voice = voices.find(voice => voice.lang.includes("en-US")) || voices.find(voice => voice.lang.includes("en")) || voices[0];
            msg.lang = 'en-US';
            msg.volume = 1;
            msg.rate = 0.8;
            window.speechSynthesis.speak(msg);
        } else {
            console.error("SpeechSynthesis không được hỗ trợ trên nền tảng này!");
        }
    }

    /**
     * Phóng to ảnh ra
     */
    zoomScaleImage(e: EventTouch, indx: number) {
        // Nếu index không hợp lệ thì ẩn popup và return luôn
        if (indx === undefined || indx === null) {
            if (this.imgZoomScale.node.parent) {
                this.imgZoomScale.node.parent.active = false;
            }
            return;
        }

        // Hiện popup
        if (this.imgZoomScale.node.parent) {
            this.imgZoomScale.node.parent.active = true;
        }

        // Lấy spriteFrame từ answerList
        this.imgZoomScale.spriteFrame = this.answerList.children[indx].getChildByPath(`Media/Img`).getComponent(Sprite).spriteFrame;

        // Hiệu ứng scale
        this.imgZoomScale.node.scale = v3(0, 0, 0);
        tween(this.imgZoomScale.node)
            .to(0.3, { scale: v3(1, 1, 1) }, { easing: 'backOut' })
            .call(() => {
                tween(this.imgZoomScale.node)
                    .to(0.08, { scale: v3(0.83, 0.83, 1) })
                    .to(0.08, { scale: v3(1, 1, 1) })
                    .to(0.08, { scale: v3(0.93, 0.93, 1) })
                    .to(0.08, { scale: v3(1, 1, 1) })
                    .start();
            })
            .start();
    }



    //=============== XỬ LÝ KẾT THÚC MAP ===============//
    /**
     * Kết thúc Map chơi
     */
    private endMap(): void {
        this.unregisterEvents();

        if (this.activeSelectionLine) {
            this.activeSelectionLine.active = false;
        }

        this.showAllAnswers();
        WordSearch.Instance.endGame();
    }


    //=============== XỬ LÝ HIỆU ỨNG HOẠT ẢNH ===============//
    /**
     * Hiệu ứng chữ di chuyển từ ô chữ xuống ô đáp án
     */
    private showWordMoveEffect(selectedCells: GridCell[], answerIndex: number, cb: Function): void {
        const answerNode = this.answerList.children[answerIndex];
        const answerLabel = answerNode.getChildByPath('Label').getComponent(Label);
        const targetPos = answerLabel.node.getWorldPosition();

        WordSearch.Instance.waitMask.active = true;

        selectedCells.forEach((cell, index) => {
            const letterNode = new Node("MovingLetter");
            letterNode.parent = this.node;
            letterNode.setWorldPosition(cell.node.getWorldPosition());

            const letterLabel = letterNode.addComponent(Label);
            letterLabel.color = new Color(80, 124, 181);
            letterLabel.string = cell.letter;
            letterLabel.fontSize = 60;
            letterLabel.lineHeight = 80;
            letterLabel.isBold = true;
            letterLabel.enableOutline = true;
            letterLabel.outlineColor = new Color(255, 255, 255);
            letterLabel.enableShadow = true;
            letterLabel.shadowColor = new Color(56, 56, 56);

            const targetX = targetPos.x + (index - selectedCells.length / 2) * 45;
            const targetY = targetPos.y;

            tween(letterNode)
                .delay(index * 0.1)
                .to(0.5, {
                    worldPosition: new Vec3(targetX, targetY, 0),
                    scale: new Vec3(1.2, 1.2, 1.2)
                })
                .to(0.2, {
                    scale: new Vec3(1, 1, 1)
                })
                .call(() => {
                    if (index === selectedCells.length - 1) {
                        answerLabel.string = this.wordAnswers[answerIndex];
                        this.node.children.forEach(child => {
                            if (child.name === "MovingLetter") {
                                child.destroy();
                            }
                        });

                        WordSearch.Instance.waitMask.active = false;
                        cb();
                    }
                })
                .start();
        });
    }



    //=============== CÁC HÀM TIỆN ÍCH ===============//
    /**
     * Lấy kích thước của ô
     * @returns Kích thước của ô
     */
    private getCellSize(): number {
        const cellBackground = this.letterCell.data.getChildByPath('bg');
        return cellBackground ? cellBackground.getComponent(UITransform).contentSize.width : 50;
    }

    /**
     * Chuyển đổi tọa độ touch thành vị trí ô trong lưới
     * @param pos Tọa độ touch
     * @returns Vị trí [hàng, cột] trong lưới
     */
    private getGridCellAtPosition(pos: Vec3): [number, number] {
        const cellSize = this.getCellSize();
        let localPos = this.wordGrid.getComponent(UITransform).convertToNodeSpaceAR(pos);
        let col = Math.floor((localPos.x + (this.grid.length * cellSize) / 2) / cellSize);
        let row = Math.floor((-localPos.y + (this.grid.length * cellSize) / 2) / cellSize);

        if (row >= 0 && row < this.grid.length && col >= 0 && col < this.grid.length) return [row, col];

        return [-1, -1];
    }

    /**
     * Thay đổi thông số dragLine
     */
    private updateSelectionLine(line: Node, length: number, angle: number) {
        line.getComponent(UITransform).setContentSize(length, 60);
        line.angle = angle;
    }

    /**
     * Lấy một dragLine chưa được sử dụng
     */
    private getUnusedSelectionLine(): Node {
        const unusedLines = this.selectionLines.children.filter(line => !line.active);
        if (unusedLines.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * unusedLines.length);
        const line = unusedLines[randomIndex];

        line.active = true;
        line.getComponent(UITransform).setContentSize(0, 60);
        line.angle = 0;
        return line;
    }

    /**
     * Reset toàn bộ trạng thái
     */
    private resetEventTouch() {
        this.selectedCells = [];
        this.touchStartRow = -1;
        this.touchStartCol = -1;
        this.selectionDirection = null;
        this.touchStartPosition = null;
    }

    /**
     * Chuyển đổi chuỗi đầu vào thành chuỗi gạch dưới
     * @param input Chuỗi đầu vào cần chuyển đổi
     * @returns Chuỗi gạch dưới tương ứng
     */
    private convertToUnderscore(input: string): string {
        let output = '';
        for (const char of input) {
            if (char === ' ') {
                output += '  ';
            } else {
                output += '- ';
            }
        }
        return output.trim();
    }


    /**
     * Tải SpriteFrame từ URL
     * @param url Đường dẫn URL của ảnh
     * @param cb Callback trả về SpriteFrame sau khi tải xong
     */
    private loadSpriteFrameFromUrl(url: string, cb: (sf: SpriteFrame) => void) {
        assetManager.loadRemote<ImageAsset>(url, { ext: ".png" }, (err, data) => {
            if (err || !data) {
                cb(null);
                return;
            }

            const texture = new Texture2D();
            texture.image = data;

            const sf = new SpriteFrame();
            sf.texture = texture;

            cb(sf);
        });
    }
}


