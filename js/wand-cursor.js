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

        document.addEventListener("mousemove", followCursor);

        document.addEventListener("click", () => {
            sparkles.classList.add("active");
            setTimeout(() => {
                sparkles.classList.remove("active");
            }, 3000);
        });

        /* sparkles.addEventListener("transitionend", () => {
            sparkles.children.forEach( (item, index) => item.classList.remove("active") );
        }); */

        function followCursor(event) {
            const wandWidth = wandCursor.clientWidth;
            const wandHeight = wandCursor.clientHeight;
            const x = event.clientX + 10 - (wandWidth/2);
            const y = event.clientY + 11 - (wandHeight/2);
            // console.log(`Mouse position: (${event.clientX}, ${event.clientY}), Wand position: (${x}, ${y})`);
            wandCursor.style.transform = `translate(${x}px, ${y}px) rotate(-40deg)`;
        }
    } else {
        console.error("wand-cursor element not found");
    }
});

