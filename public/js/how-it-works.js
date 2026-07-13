function toggleFaq(el) {
  const answer = el.nextElementSibling;
  const icon = el.querySelector('.material-symbols-outlined');
  answer.classList.toggle('open');
  icon.style.transform = answer.classList.contains('open') ? 'rotate(180deg)' : '';
}
