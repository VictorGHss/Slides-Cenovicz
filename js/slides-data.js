/**
 * Cenovicz Oftalmologia - Lista de Slides
 * Dados dos slides para o player de Digital Signage da Smart TV.
 */

const SLIDES_CONFIG = {
  defaultDuration: 12, // Duração padrão em segundos por slide
  clinicName: "Cenovicz Oftalmologia",
  slides: [
    { id: 1, src: "slides/slide_01.png", title: "Cenovicz Oftalmologia - Capa", duration: 10 },
    { id: 2, src: "slides/slide_02.png", title: "Instagram e Dicas de Saúde Visual", duration: 12 },
    { id: 3, src: "slides/slide_03.png", title: "Informativo Clínico 03", duration: 12 },
    { id: 4, src: "slides/slide_04.png", title: "Informativo Clínico 04", duration: 12 },
    { id: 5, src: "slides/slide_05.png", title: "Informativo Clínico 05", duration: 14 },
    { id: 6, src: "slides/slide_06.png", title: "Informativo Clínico 06", duration: 12 },
    { id: 7, src: "slides/slide_07.png", title: "Informativo Clínico 07", duration: 14 },
    { id: 8, src: "slides/slide_08.png", title: "Informativo Clínico 08", duration: 12 },
    { id: 9, src: "slides/slide_09.png", title: "Informativo Clínico 09", duration: 12 },
    { id: 10, src: "slides/slide_10.png", title: "Informativo Clínico 10", duration: 14 },
    { id: 11, src: "slides/slide_11.png", title: "Informativo Clínico 11", duration: 12 },
    { id: 12, src: "slides/slide_12.png", title: "Informativo Clínico 12", duration: 12 },
    { id: 13, src: "slides/slide_13.png", title: "Informativo Clínico 13", duration: 12 },
    { id: 14, src: "slides/slide_14.png", title: "Informativo Clínico 14", duration: 12 },
    { id: 15, src: "slides/slide_15.png", title: "Informativo Clínico 15", duration: 12 },
    { id: 16, src: "slides/slide_16.png", title: "Informativo Clínico 16", duration: 14 },
    { id: 17, src: "slides/slide_17.png", title: "Informativo Clínico 17", duration: 12 },
    { id: 18, src: "slides/slide_18.png", title: "Informativo Clínico 18", duration: 12 },
    { id: 19, src: "slides/slide_19.png", title: "Informativo Clínico 19", duration: 14 },
    { id: 20, src: "slides/slide_20.png", title: "Informativo Clínico 20", duration: 12 },
    { id: 21, src: "slides/slide_21.png", title: "Informativo Clínico 21", duration: 14 }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SLIDES_CONFIG;
}
