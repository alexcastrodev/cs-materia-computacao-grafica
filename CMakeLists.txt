cmake_minimum_required(VERSION 3.31)
project(compucao_grafica)

set(CMAKE_CXX_STANDARD 20)

find_package(SFML 3 QUIET COMPONENTS Graphics Window System)

# Isso é por que instalei com o Homebrew
set(SFML_DIR "/opt/homebrew/Cellar/sfml/2.6.1/lib/cmake/SFML")

add_executable(exercicio1 exec_1.cpp)

foreach(T exercicio1)
  target_link_libraries(${T} PRIVATE SFML::Graphics SFML::Window SFML::System)
endforeach()
