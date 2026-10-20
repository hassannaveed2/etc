/* ETC media manifest. Images are served from DigitalOcean Spaces (ETC/mockup/...),
   with a local copy in assets/img/ used as a fallback if the CDN is unreachable. */
(function (w) {
  var ETC = (w.ETC = w.ETC || {});
  var CDN = "https://sbsi-cdn.sgp1.digitaloceanspaces.com/ETC/mockup/";

  ETC.media = {
    etcCrest: { file: "brand/etc-crest.png", alt: "Education Testing Council crest" },
    hecCrest: { file: "brand/hec-crest.png", alt: "Higher Education Commission crest" },
    heroExam: { file: "hero-exam-hall.jpg", alt: "Candidates writing a test in a quiet examination hall" },
    heroCampus: { file: "hero-campus.jpg", alt: "Students walking across a university campus in the morning" },
    heroLaw: { file: "hero-law.jpg", alt: "A young law graduate in a black coat on the steps of a high court" },
    testLat: { file: "test-lat.jpg", alt: "A student preparing for the Law Admission Test at a desk at home" },
    testLawgat: { file: "test-lawgat.jpg", alt: "Law reports, a gavel and scales of justice on a desk" },
    testHat: { file: "test-hat.jpg", alt: "A postgraduate student studying in a university library" },
    testHaat: { file: "test-haat.jpg", alt: "A doctoral researcher working in a laboratory" },
    testUsat: { file: "test-usat.jpg", alt: "Intermediate students preparing together in a classroom" },
    institutions: { file: "institutions.jpg", alt: "University officials reviewing reports in a meeting room" },
    qualityOmr: { file: "quality-omr.jpg", alt: "OMR answer sheets feeding through a scanner" },
    qualitySealed: { file: "quality-sealed.jpg", alt: "Sealed examination paper boxes in a secure store room" },
    candidateCentre: { file: "candidate-centre.jpg", alt: "A candidate showing an admit card at a test centre entrance" },
    aboutBuilding: { file: "about-building.jpg", alt: "An institutional building in Islamabad with the Margalla Hills behind" },
    noticeDefault: { file: "notice-default.jpg", alt: "Printed notices pinned to a notice board" },
  };

  function path(key) {
    var m = ETC.media[key];
    if (!m) throw new Error("Unknown media key: " + key);
    return m.file.indexOf("brand/") === 0 ? m.file : "images/" + m.file;
  }

  ETC.mediaUrl = function (key) {
    return CDN + path(key);
  };

  ETC.localUrl = function (key) {
    return "assets/img/" + ETC.media[key].file;
  };
})(window);
