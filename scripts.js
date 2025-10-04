document.addEventListener('DOMContentLoaded', function () {

    /*** ======== Dropdown Opsi & Chart ======== ***/
    function loadOptions() {
        fetch('get_options.php')
            .then(response => response.json())
            .then(data => {
                const voteOption = document.getElementById('vote-option');
                if(voteOption){
                    voteOption.innerHTML = '';
                    data.forEach(option => {
                        const opt = document.createElement('option');
                        opt.value = option.id;
                        opt.textContent = "Sdr. " + option.name;
                        voteOption.appendChild(opt);
                    });
                }
                loadResults(data);
                displayButtons(data);
            })
            .catch(error => console.error('Error fetching options:', error));
    }

    function loadResults(options) {
        fetch('get_results.php')
            .then(response => response.json())
            .then(results => {
                const optionsWithVotes = results.map(r => r.name);
                const optionsWithoutVotes = options.filter(o => !optionsWithVotes.includes(o.name));
                const filteredData = results.filter(r => r.votes > 0);

                const voteChartElem = document.getElementById('vote-chart');
                if(voteChartElem && typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined'){
                    const ctx = voteChartElem.getContext('2d');
                    new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: filteredData.map(o => "Sdr. " + o.name),
                            datasets: [{
                                data: filteredData.map(o => o.votes),
                                backgroundColor: [
                                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                                    '#FF9F40', '#FF6F61', '#4DFF8F', '#7D4CDB', '#FFBD4C'
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: { display: true, position: 'top' },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            let label = context.label || '';
                                            label += ': ' + (context.raw > 0 ? context.raw + ' suara' : 'Tidak ada suara');
                                            return label;
                                        }
                                    }
                                },
                                datalabels: {
                                    color: '#fff',
                                    display: true,
                                    formatter: (value, ctx) => value > 0 ? `${ctx.chart.data.labels[ctx.dataIndex]}\n${value}` : '',
                                    font: { weight: 'bold', size: 14 },
                                    anchor: 'center',
                                    align: 'center'
                                }
                            }
                        },
                        plugins: [ChartDataLabels]
                    });
                }

                displayTopNames(results);
                displayAllNames(optionsWithoutVotes);
            })
            .catch(error => console.error('Error fetching results:', error));
    }

    /*** ======== Top Names ======== ***/
    function displayTopNames(data) {
        const totalVotes = data.reduce((sum, item) => sum + parseInt(item.votes), 0);
        const sortedData = data.slice().sort((a, b) => parseInt(b.votes) - parseInt(a.votes));
        const topNames = sortedData.slice(0, 5);

        const topNamesContainer = document.getElementById('top-names');
        if(!topNamesContainer) return;
        topNamesContainer.innerHTML = '';

        topNames.forEach((option, index) => {
            const votes = parseInt(option.votes);
            const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(2) : 0;

            let color;
            if(index === 0) color = '#009f00';
            else if(index === 1) color = '#0b9cfd';
            else if(index === 2) color = '#ffb700';
            else if(index === 3) color = '#ff5d51';
            else color = '#767676';

            const li = document.createElement('li');
            li.textContent = `Sdr. ${option.name}: ${votes} suara (${percentage}%)`;
            li.style.color = color;
            topNamesContainer.appendChild(li);
        });
    }

    /*** ======== Display All Names (No Votes) ======== ***/
    function displayAllNames(names) {
        const allNamesContainer = document.getElementById('all-names');
        if(!allNamesContainer) return;
        allNamesContainer.innerHTML = '';
        names.forEach(nameObj => {
            const li = document.createElement('li');
            li.textContent = nameObj.name;
            allNamesContainer.appendChild(li);
        });
    }

/*** ======== Display Buttons ======== ***/
function displayButtons(data) {
    const buttonContainer = document.getElementById('button-container');
    if(!buttonContainer) return;

    const colors = [
        '#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40','#FF6F61','#4DFF8F','#7D4CDB','#FFBD4C',
        '#FF5733','#33FF57','#5733FF','#FF33A1','#33FFF6','#F0F33C','#F0A6B8','#B8F0A6','#A6F0F0','#A6A6F0'
    ];

    buttonContainer.innerHTML = '';
    data.forEach((item, index) => {
        const div = document.createElement('div');
        div.textContent = `Sdr. ${item.name}`;   //  "Sdr."
        div.classList.add('custom-item');
        div.style.backgroundColor = colors[index % colors.length];
        buttonContainer.appendChild(div);
    });
}
    /*** ======== Widget Close Button ======== ***/
    const closeWidgetBtn = document.getElementById('closeWidgetBtn');
    if(closeWidgetBtn){
        closeWidgetBtn.addEventListener('click', function(e){
            e.stopPropagation();
            const widget = document.getElementById('infoWidget');
            if(widget) widget.style.display = 'none';
        });
    }

    /*** ======== Popup Slider ======== ***/
    const popup = document.getElementById('popup');
    const openBtn = document.getElementById('openPopupBtn');
    const closeBtn = document.querySelector('.slider-popup-content .close');
    const slides = document.querySelectorAll('.slides > div, .slides > img');
    const caption = document.getElementById('caption');
    const prevBtn = document.querySelector('.slider-prev') || document.querySelector('.prev');
    const nextBtn = document.querySelector('.slider-next') || document.querySelector('.next');

    const captionsText = [
        'Halaman Voting','Hak Voting','Hak Privasi','Demokrasi'
    ];

    let currentIndex = 0;
    let slideInterval;

    function showSlide(index){
        slides.forEach((s,i)=> s.classList.toggle('active', i===index));
        if(caption) caption.textContent = captionsText[index];
        currentIndex = index;
    }

    function nextSlide(){ showSlide((currentIndex+1)%slides.length); }
    function prevSlide(){ showSlide((currentIndex-1+slides.length)%slides.length); }

    if(openBtn && popup){
        openBtn.addEventListener('click', ()=> {
            popup.style.display = 'flex';
            showSlide(0);
            slideInterval = setInterval(nextSlide, 10000);
        });
    }

    if(closeBtn){
        closeBtn.addEventListener('click', ()=>{
            popup.style.display = 'none';
            clearInterval(slideInterval);
        });
    }

    if(prevBtn){
        prevBtn.addEventListener('click', ()=>{
            prevSlide();
            clearInterval(slideInterval);
        });
    }

    if(nextBtn){
        nextBtn.addEventListener('click', ()=>{
            nextSlide();
            clearInterval(slideInterval);
        });
    }

    if(popup){
        popup.addEventListener('click', e => {
            if(e.target === popup){
                popup.style.display = 'none';
                clearInterval(slideInterval);
            }
        });
    }

    /*** ======== Load awal ======== ***/
    loadOptions();

});


document.getElementById('aboutButtonContainer').addEventListener('click', ()=>{
    document.getElementById('popup').style.display = 'flex';
});


document.querySelector("#aboutButtonWrapper .close-btn")
  .addEventListener("click", function() {
    document.getElementById("aboutButtonWrapper").style.display = "none";
  });



