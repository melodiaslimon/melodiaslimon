// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// Gallery lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const galleryItems = document.querySelectorAll('.gallery-item img');

galleryItems.forEach(img => {
    img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Initialize map
const map = L.map('map').setView([4.0, -75.0], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add markers for partners (example locations in Tolima)
const partners = [
    {
        name: 'I.E.T.C. San Juan Bosco',
        type: 'Instituciones Educativas',
        coordinates: [4.060422478331726, -75.09502972277258],
        description: 'Institución educativa principal del proyecto'
    },
    {
        name: 'SEDTOLIMA',
        type: 'Organismos Gubernamentales',
        coordinates: [4.444275127082547, -75.24207282162575],
        description: 'Secretaría de Educación del Tolima'
    },
    {
        name: 'Productores Locales',
        type: 'Empresas Locales',
        coordinates: [4.071924736844841, -74.98747],
        description: 'Productor de limón comprometido con el proyecto'
    },
    {
        name: 'Comunidad Productora de Limón',
        type: 'Organizaciones Comunitarias',
        coordinates: [4.086350390196423, -75.01003645497497],
        description: 'Fundación Lomalimpia, alianza estratégica del proyecto'
    }
];

const colors = {
    'Instituciones Educativas': '#58CC02',
    'Empresas Locales': '#FF9500',
    'Organismos Gubernamentales': '#FFD93D',
    'Organizaciones Comunitarias': '#8E44AD'
};

partners.forEach(partner => {
    const marker = L.circleMarker(partner.coordinates, {
        radius: 8,
        fillColor: colors[partner.type],
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map);

    marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif;">
            <h4 style="margin: 0 0 8px 0; color: #2D3436;">${partner.name}</h4>
            <p style="margin: 0 0 8px 0; color: #636E72; font-size: 0.9rem;">${partner.type}</p>
            <p style="margin: 0; color: #636E72; font-size: 0.85rem;">${partner.description}</p>
        </div>
    `);
});

// Video placeholder click handlers
document.querySelectorAll('.video-placeholder').forEach(placeholder => {
    placeholder.addEventListener('click', () => {
        // Here you would typically open a video modal or navigate to video page
        alert('Funcionalidad de video próximamente disponible');
    });
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenuClose = document.querySelector('.mobile-menu-close');
const navWrapper = document.querySelector('.nav-wrapper');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

const closeMenu = () => {
    navWrapper.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
};

mobileMenuBtn.addEventListener('click', () => {
    navWrapper.classList.add('active');
    mobileMenuOverlay.classList.add('active');
});

mobileMenuClose.addEventListener('click', closeMenu);
mobileMenuOverlay.addEventListener('click', closeMenu);

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            closeMenu();
        }
    });
});


// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const rate = scrolled * -0.5;
    hero.style.transform = `translateY(${rate}px)`;
});

// Back to top button logic
const backToTopButton = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('active');
    } else {
        backToTopButton.classList.remove('active');
    }
});
