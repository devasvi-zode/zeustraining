document.addEventListener('DOMContentLoaded', function(){

    class background {
        constructor(){
            this.element = document.createElement('div');
            this.element.className = "background";
            document.body.appendChild(this.element);
            this.updateSize();
            window.addEventListener('resize', () => this.updateSize());
        }

        updateSize(){
            this.width = this.element.clientWidth;
            this.height = this.element.clientHeight;
        }
    }

    class box{
        constructor(parent,left){
            this.parent = parent;
            this.element = document.createElement('div');
            this.element.className = "box";
            this.element.style.left = `${left}px`;
            this.parent.element.appendChild(this.element);
            this.dragging = false;
            this.boxMover();
            
        }

        boxMover(){
            this.element.addEventListener('pointerdown',this.onPointerDown.bind(this)); //pointer is active
            window.addEventListener('pointermove',this.onPointerMove.bind(this)); //pointer changes coordinates
            window.addEventListener('pointerup',this.onPointerUp.bind(this)); //pointer is not active
        }

        onPointerDown(e){
            this.dragging = true;
            this.startX = e.clientX;
            this.startY = e.clientY;

            const rect = this.element.getBoundingClientRect();
            this.offsetX = this.startX - rect.left;
            this.offsetY = this.startY - rect.top;

            this.element.setPointerCapture(e.pointerId);
        }
        onPointerMove(e){

            if (!this.dragging) return;
            this.parent.updateSize();
            const x = e.clientX - this.offsetX;
            const y = e.clientY - this.offsetY;

            const maxX = this.parent.width - this.element.offsetWidth;
            const maxY = this.parent.height - this.element.offsetHeight;

            // Clamp position within bounds
            const clampedX = Math.max(0, Math.min(x, maxX));
            const clampedY = Math.max(0, Math.min(y, maxY));

            this.element.style.left = `${clampedX}px`;
            this.element.style.top = `${clampedY}px`;
        }
        onPointerUp(e){
            this.dragging = false;
            this.element.releasePointerCapture(e.pointerId);
        }
    }

    const parent = new background;
    new box(parent);
    const child1 = new box(parent);
    child1.element.style.left = "70px";
    child1.element.style.background = "yellow";

    const boxCount = 5;
    const spacing = 100; // Space between boxes

    for (let i = 0; i < boxCount; i++) {
        const left = i * (50 + spacing);
        new box(parent, left);
    }

});
