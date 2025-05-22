const translations = {
    'pt-BR': {
        'title': 'Cursor Pet',
        'active': 'Seu pet virtual está ativo!',
        'description': 'O Pet está brincando na página atual. Ele seguirá seu cursor e interagirá com elementos da página.',
        'feature1': 'Segue o cursor do mouse',
        'feature2': 'Procure por palavras e arranha elas',
        'feature3': 'Tem energia e fica cansado',
        'feature4': 'Dorme quando precisa descansar',
        'feature5': 'Clique nele para mostrar amor',
        'footer': 'Divirta-se com seu novo companheiro virtual!'
    },
    'en': {
        'title': 'Cursor Pet',
        'active': 'Your virtual pet is active!',
        'description': 'The Pet is playing on the current page. It will follow your cursor and interact with page elements.',
        'feature1': 'Follows the mouse cursor',
        'feature2': 'Look for words and scratch them',
        'feature3': 'Has energy and gets tired',
        'feature4': 'Sleeps when it needs rest',
        'feature5': 'Click it to show love',
        'footer': 'Have fun with your new virtual companion!'
    }
};

let currentLang = 'pt-BR';

function toggleLanguage() {
    currentLang = currentLang === 'pt-BR' ? 'en' : 'pt-BR';
    updateLanguage();
    document.querySelector('.language-switch').textContent = currentLang === 'pt-BR' ? 'EN' : 'PT';
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            element.textContent = translations[currentLang][key];
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const browserLang = navigator.language;
    if (browserLang.startsWith('en')) {
        currentLang = 'en';
        document.querySelector('.language-switch').textContent = 'PT';
    }
    updateLanguage();

    document.querySelector('.language-switch').addEventListener('click', toggleLanguage);
}); 