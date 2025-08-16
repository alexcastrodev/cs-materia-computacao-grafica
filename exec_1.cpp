#include <SFML/Graphics.hpp>

int main() {
    sf::RenderWindow window(sf::VideoMode({600u, 400u}), "Exercicio 1 - Translacao");

    // Criamos um retângulo e definimos sua cor e posição
    sf::RectangleShape rect(sf::Vector2f{100.f, 60.f});
    rect.setFillColor(sf::Color::Blue);
    rect.setPosition(sf::Vector2f{50.f, 50.f});

    // Loop principal
    while (window.isOpen()) {

        // Se o evendo recebido for do tipo "Closed", fecha a janela
        while (auto event = window.pollEvent()) {
            if (event->is<sf::Event::Closed>()) window.close();
        }

        // Limpa a janela com a cor preta
        window.clear(sf::Color::Black);
        
        // Desenha o retângulo na janela
        window.draw(rect);
        window.display();
    }
}
