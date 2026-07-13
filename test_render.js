const express = require('express');
const path = require('path');
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/test', async (req, res) => {
  try {
    const Analysis = require('./models/Analysis');
    const analysis = await Analysis.findById(27);
    console.log('Rendering with analysis:', !!analysis);
    res.render('analysis', { 
      title: 'Analysis Results', 
      user: { id: 8, demo: false }, 
      analysis, 
      aiResult: !!(analysis?.fonts || analysis?.typography || analysis?.layout || analysis?.design_style)
    });
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).send('Error: ' + err.message);
  }
});

app.listen(3003, () => console.log('Test server on 3003'));