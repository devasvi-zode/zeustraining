document.addEventListener('DOMContentLoaded', function () {
    class Container {
        constructor(color) {
            this.element = document.createElement('div');
            this.element.className = "container";
            this.element.style.backgroundColor = color;
            document.body.appendChild(this.element);

            this.updateSize();
            window.addEventListener('resize', () => this.updateSize());
        }

        updateSize() {
            this.width = this.element.clientWidth;
            this.height = this.element.clientHeight;
        }
    }

    class Box {
        constructor(parent, color) {
            this.parent = parent;
            this.element = document.createElement('div');
            this.element.className = "box";
            this.element.style.backgroundColor = color;
            this.parent.element.appendChild(this.element);
            this.dragging = false;
            this.boxMover();
        }

        boxMover() {
            this.element.addEventListener('pointerdown', this.onPointerDown.bind(this));
            this.element.addEventListener('pointermove', this.onPointerMove.bind(this));
            this.element.addEventListener('pointerup', this.onPointerUp.bind(this));
        }

        onPointerDown(e) {
            this.dragging = true;
            const rect = this.element.getBoundingClientRect();
            this.offsetX = e.clientX - rect.left;
            this.offsetY = e.clientY - rect.top;
            this.element.setPointerCapture(e.pointerId);
        }

        onPointerMove(e) {
            if (!this.dragging) return;

            this.parent.updateSize();
            const parentRect = this.parent.element.getBoundingClientRect();

            const x = e.clientX - parentRect.left - this.offsetX;
            const y = e.clientY - parentRect.top - this.offsetY;

            
            // Calculate visible bounds (intersection of container and viewport)
            const visibleRight = Math.min(parentRect.right, window.innerWidth);
            const visibleBottom = Math.min(parentRect.bottom, window.innerHeight);

            const visibleWidth = visibleRight - parentRect.left;
            const visibleHeight = visibleBottom - parentRect.top;

            const maxX = visibleWidth - this.element.offsetWidth;
            const maxY = visibleHeight - this.element.offsetHeight;

            const clampedX = Math.max(0, Math.min(x, maxX));
            const clampedY = Math.max(0, Math.min(y, maxY));

            this.element.style.left = `${clampedX}px`;
            this.element.style.top = `${clampedY}px`;
        }

        onPointerUp(e) {
            this.dragging = false;
            this.element.releasePointerCapture(e.pointerId);
        }
    }

    const backgroundColors = ['#FFCCCC', '#CCFFCC', '#CCCCFF', '#FFFFCC', '#FFCCFF'];
    const boxColors = ['#FF6666', '#66FF66', '#6666FF', '#FFFF66', '#FF66FF'];

    for (let i = 0; i < backgroundColors.length; i++) {
        const bg = new Container(backgroundColors[i]);
        new Box(bg, boxColors[i]);
    }
});
