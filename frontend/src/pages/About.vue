<template>
  <main>
    <h1>About</h1>
    <p id="greeting">
      Hello! I'm Eve Aviv Keinan, and Distillogue is the primary project in <a href="https://evavkein.com/portfolio" class="core_contentButton">my programming portfolio</a>
    </p>

    <hr/>

    <h2>Disclaimers</h2>
    <ul>
      <li>Data you submit on this website is public (no proper authentication yet, only usernames) and very temporary (for rapid development's sake, all user-generated data is deleted on every update)</li>
      <li>In this early stage of the project, core features are a much higher priority for me than interface beauty. What currently exists is basic development styling, and I'm keenly aware of many of its thematic/design deficiencies</li>
    </ul>

    <hr/>

    <h2>Concepts</h2>
    <ul>
      <li>
        <p>
          <strong>A social tool, not a social hub</strong>: For many reasons, I'm not interested in this being anyone's primary social app
        </p>
        <p>
          I plan for this to be a social-media-adjacent tool for people who primarily communicate elsewhere: The future/existence of public posts beyond the project's early development is very uncertain, and plans for any user-to-user interactions (as opposed to post/topic-centric ones) are minimal and under intense scrutiny
        </p>
      </li>
      <li>
        <p>
          <strong>Highly customizable</strong>: The project's main gimmick is the (planned) wide of variety of options for post configurations: Allowing users to formulate their preferred social environment with just the features they appreciate, with which they 'distill' the social dynamics/interactions/options to their preference (which of course includes the ability to save custom presets)
        </p>
        <p>
          I also plan on there being multiple layout options, but intergrating that with a variety of configurations sounds like an inordinate amount of labor (at least currently as a solo dev), and I only conceived two layouts I'm satisfied with thus far
        </p>
        <p>
          I'm open to the idea of allowing user-created plugins for various configurations/layouts (and/or maybe even robust support for forking e.g Mastodon), but that's far off in the future if/when the project matures and/or gains a userbase
        </p>
      </li>
      <li>
        <p>
          <strong>User-moderated</strong>: To avoid the time-sinks and drama of platform moderation, I want to hand over moderation to the users as much as legally/ethically viable (which is much more sensible alongside plans to remove public posts)
        </p>
        <p>
          I plan on implementing robust configurations for moderation paradigms (e.g direct/representative-democracy, creator-approved moderators) and functionalities, alongside carefully-conceived optional and/or obligatory countermeasures (likely just for the less-democratic ones) to mitigate abuse
        </p>
      </li>
    </ul>

    <hr/>

    <h2>Status & Prospects</h2>

    <ul>
      <li>
        I'm currently the sole contributor to the project, and my attention is split between this, jobseeking, and working on my personal site (to improve my chances when jobseeking). I'm also the sole designer for this (in both UI/UX and systems/concept), which slows down development a bit
      </li>
      <li>
        I dont know how much I'd wanna work on this project in my free time when I'm employed, but if it'll have any interest/co-contributors I definitely wouldn't wanna abandon it
      </li>
    </ul>

    <hr/>

    <h2>Contact</h2>

    <ul>
      <li>
        Technical: <a class="core_contentButton">https://github.com/EvAvKein/Distillogue/issues</a>
      </li>
      <li>
        Questions & suggestions: <a class="core_contentButton">https://github.com/EvAvKein/Distillogue/discussions</a>
      </li>
      <li>
        High-priority / private: <address>EvAvKein@gmail.com</address>
      </li>
    </ul>
  </main>
</template>

<style scoped>
  @import "./_simpleInfoPage.css";
</style>