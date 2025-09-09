// --- Mobile menu toggle ---
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

const mobileMenuLinks = mobileMenu.querySelectorAll('a');
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// --- Scroll Animation Logic ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1 // Trigger when 10% of the element is visible
});

const elementsToReveal = document.querySelectorAll('.reveal');
elementsToReveal.forEach(el => observer.observe(el));

// --- Modal Logic ---
const openModalButton = document.getElementById('open-modal-button');
const closeModalButton = document.getElementById('close-modal-button');
const modal = document.getElementById('bullet-points-modal');
const modalContent = document.getElementById('modal-content');

openModalButton.addEventListener('click', () => {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-95');
});

const closeModal = () => {
    modal.classList.add('opacity-0');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('pointer-events-none');
    }, 300); // Match transition duration
};

closeModalButton.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
    // Close modal if the backdrop is clicked
    if (event.target === modal) {
        closeModal();
    }
});

// --- Contact Form Submission Logic ---
const contactForm = document.getElementById('contact-form');
const submitButton = document.getElementById('submit-button');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent actual form submission for this demo
    
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;

    // Simulate a network request
    setTimeout(() => {
        submitButton.textContent = 'Message Sent! ✅';
        contactForm.reset(); // Clear the form
        
        // Revert button to original state after a few seconds
        setTimeout(() => {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }, 3000);
    }, 1500); // Simulate 1.5 second delay
});
