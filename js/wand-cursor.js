document.addEventListener("DOMContentLoaded", () => {
    const wandCursor = document.getElementById("wand-cursor");
    const sparkles = document.querySelector(".sparkles");

    if (wandCursor && sparkles) {
        document.addEventListener("mouseenter", () => { 
            wandCursor.style.display = 'block'; 
        });

        document.addEventListener("mouseleave", () => { 
            wandCursor.style.display = 'none'; 
        });

        document.addEventListener("mousemove", updateCursorPosition);
        document.addEventListener("scroll", () => {
            const event = {
                clientX: window.mouseX || 0,
                clientY: window.mouseY || 0,
                type: 'scroll'
            };
            updateCursorPosition(event);
        });

        document.addEventListener("click", () => {
            sparkles.classList.add("active");
            setTimeout(() => {
                sparkles.classList.remove("active");
            }, 3000);
        });

        function updateCursorPosition(event) {
            const wandWidth = wandCursor.clientWidth;
            const wandHeight = wandCursor.clientHeight;
            const x = event.clientX + 10 - (wandWidth/2) + window.scrollX;
            const y = event.clientY + 11 - (wandHeight/2) + window.scrollY;
            // console.log(`Mouse position: (${event.clientX}, ${event.clientY}), Wand position: (${x}, ${y})`);
            wandCursor.style.transform = `translate(${x}px, ${y}px) rotate(-40deg)`;

            // Store the mouse position for scroll events
            if (event.type === 'mousemove') {
                window.mouseX = event.clientX;
                window.mouseY = event.clientY;
            }
        }
    } else {
        console.error("wand-cursor element not found");
    }
});

