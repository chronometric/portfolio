//INIT DATA
let data = {
    universities: [
        {
            during: "2013 – 2017",
            name: "Hill College",
            job: "Bachelor's Degree in Computer Science"
        },
    ],
    experiences: [
        {
            during: "2020 - Present",
            job: "Software Engineer",
            where: "Codepaper Technologies",
            des: "Developed an AI-based SaaS platform with CNN, LSTM, Transformer, and other sequence models on AWS using React, Django, PyTorch, Keras, and Python.<br><br>Developed a web application using C++, C#, JavaScript, ASP.NET, and AngularJS that allowed users to upload and search files in cloud storage (Elasticsearch).<br><br>Participated in the design and implementation of CI/CD and DevOps for agile projects using Python, JavaScript, Node.js, Git, Linux, Docker, Kubernetes, Nginx, Jenkins, and AWS; used tools such as React DevTools to speed up debugging and reduce debugging time by about 50%.",
        },
        {
            during: "2017 - 2020",
            job: "Software Engineer",
            where: "Pizza Hut",
            des: "Developed an API using C++, C#, .NET Core, ASP.NET, and SignalR that integrated with a third-party payment processor and enabled real-time chat and secure, reliable transactions for an e-commerce platform.<br><br>Developed a Customer Relationship Management system and company management tooling to track inventory, manage the supply chain, and analyze and extract data from competitor websites using C++, C#, .NET Framework, SQL Server, Selenium, WCF, .NET Core, Angular, and Azure Active Directory.<br><br>Maintained a large web application using HTML/CSS, JavaScript, jQuery, and PHP (Laravel); automated the monthly supplier payment billing cycle with PHP and MySQL, ran payment jobs on schedule, and adjusted conditional business logic through a web interface.",
        },
    ],

}

function initUniversity() {
    $("#university").html('')
    data.universities.forEach(universitiy => {
        $("#university").append(`
            <div class="timeline-item clearfix">
                <div class="left-part">
                    <h5 class="item-period">${universitiy.during}</h5>
                    <span class="item-company">${universitiy.name}</span>
                </div>
                <div class="divider"></div>
                <div class="right-part">
                    <h4 class="item-title">${universitiy.job}</h4>
                </div>
            </div>
        `)
    })
}

function initExperience() {
    $("#experience").html('')
    data.experiences.forEach(experience => {
        $("#experience").append(`
        <div class="timeline-item clearfix">
            <div class="left-part">
                <h5 class="item-period">${experience.during}</h5>
                <span class="item-company">${experience.where}</span>
            </div>
            <div class="divider"></div>
            <div class="right-part">
                <h4 class="item-title">${experience.job}</h4>
                <p>${experience.des}</p>
            </div>
        </div>
        `)
    })
}


function init() {
    initUniversity();
    initExperience();
}

init();
